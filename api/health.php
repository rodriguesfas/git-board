<?php
/**
 * Health check endpoint para monitoramento
 */

header('Content-Type: application/json');

$health = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'version' => '1.0.0',
    'services' => []
];

// Verificar se os arquivos de dados existem
$dataDir = __DIR__ . '/data';
$repositoriesFile = $dataDir . '/repositories.json';
$eventsFile = $dataDir . '/events.json';

$health['services']['storage'] = [
    'status' => 'ok',
    'data_directory' => is_dir($dataDir) ? 'exists' : 'missing',
    'repositories_file' => file_exists($repositoriesFile) ? 'exists' : 'missing',
    'events_file' => file_exists($eventsFile) ? 'exists' : 'missing'
];

// Verificar se SQLite está disponível
$health['services']['sqlite'] = [
    'status' => extension_loaded('pdo_sqlite') ? 'ok' : 'unavailable',
    'extension' => extension_loaded('pdo_sqlite') ? 'loaded' : 'not_loaded'
];

// Verificar permissões de escrita
$health['services']['permissions'] = [
    'status' => is_writable($dataDir) ? 'ok' : 'error',
    'data_directory_writable' => is_writable($dataDir)
];

// Status geral
$overallStatus = 'ok';
foreach ($health['services'] as $service) {
    if ($service['status'] !== 'ok') {
        $overallStatus = 'error';
        break;
    }
}

$health['status'] = $overallStatus;

// Retornar status HTTP apropriado
http_response_code($overallStatus === 'ok' ? 200 : 503);

echo json_encode($health, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
