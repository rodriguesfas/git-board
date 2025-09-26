<?php

class JsonStorage
{
    private $dataDir;
    private $repositoriesFile;
    private $eventsFile;

    public function __construct()
    {
        $this->dataDir = __DIR__ . '/../data';
        $this->repositoriesFile = $this->dataDir . '/repositories.json';
        $this->eventsFile = $this->dataDir . '/events.json';
        
        // Criar diretório se não existir
        if (!is_dir($this->dataDir)) {
            mkdir($this->dataDir, 0755, true);
        }
        
        // Inicializar arquivos se não existirem
        $this->initializeFiles();
    }

    private function initializeFiles()
    {
        if (!file_exists($this->repositoriesFile)) {
            file_put_contents($this->repositoriesFile, json_encode([]));
        }
        if (!file_exists($this->eventsFile)) {
            file_put_contents($this->eventsFile, json_encode([]));
        }
    }

    private function readData($file)
    {
        $content = file_get_contents($file);
        return json_decode($content, true) ?: [];
    }

    private function writeData($file, $data)
    {
        return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    public function getRepositories()
    {
        return $this->readData($this->repositoriesFile);
    }

    public function getRepositoryByGithubId($githubId)
    {
        $repositories = $this->getRepositories();
        foreach ($repositories as $repo) {
            if ($repo['github_id'] == $githubId) {
                return $repo;
            }
        }
        return null;
    }

    public function saveRepository($data)
    {
        $repositories = $this->getRepositories();
        $existing = $this->getRepositoryByGithubId($data['id']);
        
        $repoData = [
            'id' => $existing ? $existing['id'] : uniqid(),
            'github_id' => $data['id'],
            'name' => $data['name'],
            'full_name' => $data['full_name'],
            'owner_login' => $data['owner']['login'],
            'owner_avatar_url' => $data['owner']['avatar_url'] ?? null,
            'private' => $data['private'] ? 1 : 0,
            'html_url' => $data['html_url'],
            'description' => $data['description'] ?? null,
            'created_at' => $existing ? $existing['created_at'] : date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        if ($existing) {
            // Atualizar repositório existente
            foreach ($repositories as &$repo) {
                if ($repo['github_id'] == $data['id']) {
                    $repo = $repoData;
                    break;
                }
            }
        } else {
            // Adicionar novo repositório
            $repositories[] = $repoData;
        }

        $this->writeData($this->repositoriesFile, $repositories);
        return $repoData['id'];
    }

    public function getEvents($limit = 50, $repositoryId = null)
    {
        $events = $this->readData($this->eventsFile);
        
        if ($repositoryId) {
            $events = array_filter($events, function($event) use ($repositoryId) {
                return $event['repository_id'] == $repositoryId;
            });
        }
        
        // Ordenar por data decrescente e limitar
        usort($events, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        return array_slice($events, 0, $limit);
    }

    public function saveEvent($data)
    {
        $events = $this->readData($this->eventsFile);
        
        $eventData = [
            'id' => uniqid(),
            'repository_id' => $data['repository_id'],
            'event_type' => $data['event_type'],
            'action' => $data['action'] ?? null,
            'actor_login' => $data['actor_login'] ?? null,
            'actor_avatar_url' => $data['actor_avatar_url'] ?? null,
            'title' => $data['title'] ?? null,
            'body' => $data['body'] ?? null,
            'number' => $data['number'] ?? null,
            'state' => $data['state'] ?? null,
            'merged' => $data['merged'] ? 1 : 0,
            'commits_count' => $data['commits_count'] ?? 0,
            'files_changed' => $data['files_changed'] ?? 0,
            'additions' => $data['additions'] ?? 0,
            'deletions' => $data['deletions'] ?? 0,
            'branch' => $data['branch'] ?? null,
            'ref' => $data['ref'] ?? null,
            'raw_data' => json_encode($data['raw_data'] ?? []),
            'created_at' => date('Y-m-d H:i:s')
        ];

        $events[] = $eventData;
        $this->writeData($this->eventsFile, $events);
        
        return $eventData['id'];
    }

    public function getStats($repositoryId = null)
    {
        $repositories = $this->getRepositories();
        $events = $this->getEvents(1000, $repositoryId); // Buscar mais eventos para estatísticas
        
        $stats = [];
        
        foreach ($repositories as $repo) {
            if ($repositoryId && $repo['id'] != $repositoryId) {
                continue;
            }
            
            $repoEvents = array_filter($events, function($event) use ($repo) {
                return $event['repository_id'] == $repo['id'];
            });
            
            $stats[] = [
                'repository_name' => $repo['name'],
                'full_name' => $repo['full_name'],
                'total_events' => count($repoEvents),
                'unique_contributors' => count(array_unique(array_column($repoEvents, 'actor_login'))),
                'pushes' => count(array_filter($repoEvents, function($e) { return $e['event_type'] == 'push'; })),
                'pull_requests' => count(array_filter($repoEvents, function($e) { return $e['event_type'] == 'pull_request'; })),
                'issues' => count(array_filter($repoEvents, function($e) { return $e['event_type'] == 'issues'; })),
                'last_activity' => count($repoEvents) > 0 ? max(array_column($repoEvents, 'created_at')) : null
            ];
        }
        
        return $stats;
    }

    public function getUserStats($repositoryId = null, $limit = 10)
    {
        $events = $this->getEvents(1000, $repositoryId);
        $userStats = [];
        
        foreach ($events as $event) {
            if (!$event['actor_login']) continue;
            
            $login = $event['actor_login'];
            if (!isset($userStats[$login])) {
                $userStats[$login] = [
                    'actor_login' => $login,
                    'total_events' => 0,
                    'pushes' => 0,
                    'pull_requests' => 0,
                    'issues' => 0,
                    'total_additions' => 0,
                    'total_deletions' => 0,
                    'last_activity' => $event['created_at']
                ];
            }
            
            $userStats[$login]['total_events']++;
            $userStats[$login]['total_additions'] += $event['additions'];
            $userStats[$login]['total_deletions'] += $event['deletions'];
            
            if ($event['event_type'] == 'push') $userStats[$login]['pushes']++;
            if ($event['event_type'] == 'pull_request') $userStats[$login]['pull_requests']++;
            if ($event['event_type'] == 'issues') $userStats[$login]['issues']++;
            
            if (strtotime($event['created_at']) > strtotime($userStats[$login]['last_activity'])) {
                $userStats[$login]['last_activity'] = $event['created_at'];
            }
        }
        
        // Ordenar por total de eventos e limitar
        uasort($userStats, function($a, $b) {
            return $b['total_events'] - $a['total_events'];
        });
        
        return array_slice(array_values($userStats), 0, $limit);
    }

    public function getEventStats($repositoryId = null)
    {
        $events = $this->getEvents(1000, $repositoryId);
        $eventStats = [];
        
        foreach ($events as $event) {
            $type = $event['event_type'];
            if (!isset($eventStats[$type])) {
                $eventStats[$type] = [
                    'event_type' => $type,
                    'count' => 0,
                    'unique_actors' => []
                ];
            }
            
            $eventStats[$type]['count']++;
            if ($event['actor_login']) {
                $eventStats[$type]['unique_actors'][$event['actor_login']] = true;
            }
        }
        
        // Converter unique_actors para contagem
        foreach ($eventStats as &$stat) {
            $stat['unique_actors'] = count($stat['unique_actors']);
        }
        
        // Ordenar por contagem
        uasort($eventStats, function($a, $b) {
            return $b['count'] - $a['count'];
        });
        
        return array_values($eventStats);
    }

    public function getRecentActivity($hours = 24, $repositoryId = null)
    {
        $events = $this->getEvents(1000, $repositoryId);
        $cutoff = date('Y-m-d H:i:s', strtotime("-{$hours} hours"));
        
        $recentEvents = array_filter($events, function($event) use ($cutoff) {
            return $event['created_at'] >= $cutoff;
        });
        
        // Agrupar por hora
        $activity = [];
        foreach ($recentEvents as $event) {
            $hour = date('Y-m-d H:00:00', strtotime($event['created_at']));
            if (!isset($activity[$hour])) {
                $activity[$hour] = [
                    'hour' => $hour,
                    'events_count' => 0,
                    'unique_contributors' => []
                ];
            }
            
            $activity[$hour]['events_count']++;
            if ($event['actor_login']) {
                $activity[$hour]['unique_contributors'][$event['actor_login']] = true;
            }
        }
        
        // Converter unique_contributors para contagem
        foreach ($activity as &$stat) {
            $stat['unique_contributors'] = count($stat['unique_contributors']);
        }
        
        // Ordenar por hora
        ksort($activity);
        
        return array_values($activity);
    }
}
