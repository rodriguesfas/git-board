<?php
/**
 * Server-Sent Events endpoint para notificar novos eventos
 */

// Configurar headers para SSE
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Cache-Control');

// Função para enviar evento SSE
function sendSSEEvent($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data) . "\n\n";
    ob_flush();
    flush();
}

// Função para enviar heartbeat
function sendHeartbeat() {
    echo "event: heartbeat\n";
    echo "data: " . json_encode(['timestamp' => time()]) . "\n\n";
    ob_flush();
    flush();
}

// Verificar se há novos eventos desde o último timestamp
$lastEventId = isset($_GET['lastEventId']) ? (int)$_GET['lastEventId'] : 0;

// Arquivo para armazenar o último evento processado
$lastEventFile = __DIR__ . '/data/last_event_id.txt';

// Função para ler o último ID de evento
function getLastEventId() {
    global $lastEventFile;
    if (file_exists($lastEventFile)) {
        return (int)file_get_contents($lastEventFile);
    }
    return 0;
}

// Função para salvar o último ID de evento
function saveLastEventId($id) {
    global $lastEventFile;
    file_put_contents($lastEventFile, $id);
}

// Função para verificar se há novos eventos
function hasNewEvents($lastId) {
    $eventsFile = __DIR__ . '/data/events.json';
    if (!file_exists($eventsFile)) {
        return false;
    }
    
    $events = json_decode(file_get_contents($eventsFile), true);
    if (!$events || !is_array($events)) {
        return false;
    }
    
    // Verificar se há eventos com ID maior que o último
    foreach ($events as $event) {
        if (isset($event['id']) && $event['id'] > $lastId) {
            return true;
        }
    }
    
    return false;
}

// Função para obter novos eventos
function getNewEvents($lastId) {
    $eventsFile = __DIR__ . '/data/events.json';
    if (!file_exists($eventsFile)) {
        return [];
    }
    
    $events = json_decode(file_get_contents($eventsFile), true);
    if (!$events || !is_array($events)) {
        return [];
    }
    
    $newEvents = [];
    foreach ($events as $event) {
        if (isset($event['id']) && $event['id'] > $lastId) {
            $newEvents[] = $event;
        }
    }
    
    return $newEvents;
}

// Loop principal do SSE
$heartbeatCount = 0;
$maxHeartbeats = 300; // 5 minutos (300 * 1 segundo)

while ($heartbeatCount < $maxHeartbeats) {
    // Verificar se há novos eventos
    if (hasNewEvents($lastEventId)) {
        $newEvents = getNewEvents($lastEventId);
        
        foreach ($newEvents as $event) {
            sendSSEEvent('new_event', [
                'event' => $event,
                'message' => 'Novo evento recebido',
                'timestamp' => time()
            ]);
            
            // Atualizar o último ID
            $lastEventId = $event['id'];
            saveLastEventId($lastEventId);
        }
    }
    
    // Enviar heartbeat a cada 10 segundos
    if ($heartbeatCount % 10 === 0) {
        sendHeartbeat();
    }
    
    $heartbeatCount++;
    sleep(1); // Aguardar 1 segundo
}

// Fechar conexão
sendSSEEvent('close', ['message' => 'Conexão fechada']);
?>
