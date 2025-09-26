<?php
/**
 * API simplificada usando armazenamento JSON
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-GitHub-Event, X-Hub-Signature-256');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/models/JsonStorage.php';

class WebhookHandler
{
    private $storage;

    public function __construct()
    {
        $this->storage = new JsonStorage();
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        try {
            switch ($method) {
                case 'POST':
                    if ($path === '/api/index_json.php' || $path === '/') {
                        $this->handleWebhook();
                    } else {
                        $this->sendResponse(['error' => 'Endpoint não encontrado'], 404);
                    }
                    break;

                case 'GET':
                    $this->handleGetRequest($path);
                    break;

                case 'DELETE':
                    $this->handleDeleteRequest($path);
                    break;

                default:
                    $this->sendResponse(['error' => 'Método não permitido'], 405);
            }
        } catch (Exception $e) {
            error_log("Erro na API: " . $e->getMessage());
            $this->sendResponse(['error' => 'Erro interno do servidor'], 500);
        }
    }

    private function handleWebhook()
    {
        // Verificar se é um webhook do GitHub
        $eventType = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? null;

        if (!$eventType) {
            $this->sendResponse(['error' => 'Header X-GitHub-Event não encontrado'], 400);
            return;
        }

        // Ler o payload
        $payload = file_get_contents('php://input');
        $data = json_decode($payload, true);

        if (!$data) {
            $this->sendResponse(['error' => 'Payload JSON inválido'], 400);
            return;
        }

        // Processar o evento
        $this->processEvent($eventType, $data);

        $this->sendResponse(['status' => 'success', 'event_type' => $eventType]);
    }

    private function processEvent($eventType, $data)
    {
        // Criar ou atualizar repositório
        if (isset($data['repository'])) {
            $repositoryId = $this->storage->saveRepository($data['repository']);
        } else {
            error_log("Repositório não encontrado no payload");
            return;
        }

        // Extrair dados do evento baseado no tipo
        $eventData = $this->extractEventData($eventType, $data, $repositoryId);

        // Salvar evento
        $eventId = $this->storage->saveEvent($eventData);
    }

    private function extractEventData($eventType, $data, $repositoryId)
    {
        $eventData = [
            'repository_id' => $repositoryId,
            'event_type' => $eventType,
            'raw_data' => $data
        ];

        switch ($eventType) {
            case 'push':
                $eventData['actor_login'] = $data['pusher']['name'] ?? $data['sender']['login'] ?? null;
                $eventData['actor_avatar_url'] = $data['sender']['avatar_url'] ?? null;
                $eventData['commits_count'] = count($data['commits'] ?? []);
                $eventData['ref'] = $data['ref'] ?? null;
                $eventData['branch'] = str_replace('refs/heads/', '', $data['ref'] ?? '');
                
                // Calcular mudanças de arquivos
                $additions = 0;
                $deletions = 0;
                $filesChanged = 0;
                
                foreach ($data['commits'] ?? [] as $commit) {
                    $additions += $commit['added'] ? count($commit['added']) : 0;
                    $deletions += $commit['removed'] ? count($commit['removed']) : 0;
                    $filesChanged += $commit['modified'] ? count($commit['modified']) : 0;
                }
                
                $eventData['additions'] = $additions;
                $eventData['deletions'] = $deletions;
                $eventData['files_changed'] = $filesChanged;
                break;

            case 'pull_request':
                $eventData['action'] = $data['action'] ?? null;
                $eventData['actor_login'] = $data['sender']['login'] ?? null;
                $eventData['actor_avatar_url'] = $data['sender']['avatar_url'] ?? null;
                $eventData['title'] = $data['pull_request']['title'] ?? null;
                $eventData['body'] = $data['pull_request']['body'] ?? null;
                $eventData['number'] = $data['pull_request']['number'] ?? null;
                $eventData['state'] = $data['pull_request']['state'] ?? null;
                $eventData['merged'] = $data['pull_request']['merged'] ?? false;
                $eventData['additions'] = $data['pull_request']['additions'] ?? 0;
                $eventData['deletions'] = $data['pull_request']['deletions'] ?? 0;
                $eventData['files_changed'] = $data['pull_request']['changed_files'] ?? 0;
                break;

            case 'issues':
                $eventData['action'] = $data['action'] ?? null;
                $eventData['actor_login'] = $data['sender']['login'] ?? null;
                $eventData['actor_avatar_url'] = $data['sender']['avatar_url'] ?? null;
                $eventData['title'] = $data['issue']['title'] ?? null;
                $eventData['body'] = $data['issue']['body'] ?? null;
                $eventData['number'] = $data['issue']['number'] ?? null;
                $eventData['state'] = $data['issue']['state'] ?? null;
                break;

            case 'issue_comment':
                $eventData['action'] = $data['action'] ?? null;
                $eventData['actor_login'] = $data['sender']['login'] ?? null;
                $eventData['actor_avatar_url'] = $data['sender']['avatar_url'] ?? null;
                $eventData['title'] = 'Comentário em issue #' . ($data['issue']['number'] ?? '');
                $eventData['body'] = $data['comment']['body'] ?? null;
                $eventData['number'] = $data['issue']['number'] ?? null;
                break;

            case 'pull_request_review':
                $eventData['action'] = $data['action'] ?? null;
                $eventData['actor_login'] = $data['sender']['login'] ?? null;
                $eventData['actor_avatar_url'] = $data['sender']['avatar_url'] ?? null;
                $eventData['title'] = 'Review em PR #' . ($data['pull_request']['number'] ?? '');
                $eventData['body'] = $data['review']['body'] ?? null;
                $eventData['number'] = $data['pull_request']['number'] ?? null;
                $eventData['state'] = $data['review']['state'] ?? null;
                break;

            default:
                $eventData['actor_login'] = $data['sender']['login'] ?? null;
                $eventData['actor_avatar_url'] = $data['sender']['avatar_url'] ?? null;
                $eventData['action'] = $data['action'] ?? null;
        }

        return $eventData;
    }

    private function handleGetRequest($path)
    {
        $pathParts = explode('/', trim($path, '/'));
        
        if (count($pathParts) >= 2 && $pathParts[0] === 'api') {
            $endpoint = $pathParts[1];
            
            switch ($endpoint) {
                case 'timeline':
                    $limit = $_GET['limit'] ?? 50;
                    $repositoryId = $_GET['repository_id'] ?? null;
                    $timeline = $this->storage->getEvents($limit, $repositoryId);
                    $this->sendResponse(['timeline' => $timeline]);
                    break;

                case 'stats':
                    $repositoryId = $_GET['repository_id'] ?? null;
                    $stats = $this->storage->getStats($repositoryId);
                    $this->sendResponse(['stats' => $stats]);
                    break;

                case 'user-stats':
                    $repositoryId = $_GET['repository_id'] ?? null;
                    $limit = $_GET['limit'] ?? 10;
                    $userStats = $this->storage->getUserStats($repositoryId, $limit);
                    $this->sendResponse(['user_stats' => $userStats]);
                    break;

                case 'event-stats':
                    $repositoryId = $_GET['repository_id'] ?? null;
                    $eventStats = $this->storage->getEventStats($repositoryId);
                    $this->sendResponse(['event_stats' => $eventStats]);
                    break;

                case 'repositories':
                    $repositories = $this->storage->getRepositories();
                    $this->sendResponse(['repositories' => $repositories]);
                    break;

                case 'activity':
                    $hours = $_GET['hours'] ?? 24;
                    $repositoryId = $_GET['repository_id'] ?? null;
                    $activity = $this->storage->getRecentActivity($hours, $repositoryId);
                    $this->sendResponse(['activity' => $activity]);
                    break;

                default:
                    $this->sendResponse(['error' => 'Endpoint não encontrado'], 404);
            }
        } else {
            $this->sendResponse(['error' => 'Endpoint não encontrado'], 404);
        }
    }

    private function handleDeleteRequest($path)
    {
        // Extrair ID do repositório da URL
        if (preg_match('/\/api\/repositories\/([^\/]+)/', $path, $matches)) {
            $repositoryId = $matches[1];
            
            $success = $this->storage->deleteRepository($repositoryId);
            
            if ($success) {
                $this->sendResponse([
                    'message' => 'Repositório e todos os seus dados foram removidos com sucesso',
                    'repository_id' => $repositoryId
                ]);
            } else {
                $this->sendResponse(['error' => 'Repositório não encontrado'], 404);
            }
        } else {
            $this->sendResponse(['error' => 'Endpoint DELETE não encontrado'], 404);
        }
    }

    private function sendResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
}

// Inicializar o handler
$handler = new WebhookHandler();
$handler->handleRequest();
