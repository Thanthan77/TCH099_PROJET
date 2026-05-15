<?php
// Gestion OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: *");
    header("Access-Control-Allow-Methods: *");
    http_response_code(200);
    exit();
}

// Méthodes HTTP
function get($route, $path_to_include)    { if ($_SERVER['REQUEST_METHOD'] === 'GET')    route($route, $path_to_include); }
function post($route, $path_to_include)   { if ($_SERVER['REQUEST_METHOD'] === 'POST')   route($route, $path_to_include); }
function put($route, $path_to_include)    { if ($_SERVER['REQUEST_METHOD'] === 'PUT')    route($route, $path_to_include); }
function patch($route, $path_to_include)  { if ($_SERVER['REQUEST_METHOD'] === 'PATCH')  route($route, $path_to_include); }
function delete($route, $path_to_include) { if ($_SERVER['REQUEST_METHOD'] === 'DELETE') route($route, $path_to_include); }
function any($route, $path_to_include)    { route($route, $path_to_include); }


// ROUTER PRINCIPAL
function route($route, $path_to_include)
{
    $callback = $path_to_include;

    // Ajout automatique .php
    if (!is_callable($callback)) {
        if (!str_contains($path_to_include, '.php')) {
            $path_to_include .= '.php';
        }
    }

    // Route 404
    if ($route === "/404") {
        include_once __DIR__ . "/$path_to_include";
        exit();
    }

    // --- NORMALISATION DE L’URL (Azure + sécurité) ---
    $request_url = filter_var($_SERVER['REQUEST_URI'], FILTER_SANITIZE_URL);

    // Nettoyage Azure
    $request_url = str_replace('/index.php', '', $request_url);
    $request_url = str_replace('/home/site/wwwroot', '', $request_url);
    $request_url = str_replace('/site/wwwroot', '', $request_url);
    $request_url = str_replace('/api/api', '/api', $request_url);

    // Enlever query string
    $request_url = strtok($request_url, '?');

    // Enlever slash final sauf si racine
    if ($request_url !== '/') {
        $request_url = rtrim($request_url, '/');
    }

    // Nettoyage des doubles slash
    while (str_contains($request_url, '//')) {
        $request_url = str_replace('//', '/', $request_url);
    }

    // Découpage
    $route_parts = explode('/', $route);
    $request_url_parts = explode('/', $request_url);

    array_shift($route_parts);
    array_shift($request_url_parts);

    // Cas route racine
    if ($route_parts[0] === '' && count($request_url_parts) === 0) {
        if (is_callable($callback)) {
            call_user_func_array($callback, []);
            exit();
        }
        include_once __DIR__ . "/$path_to_include";
        exit();
    }

    // Nombre de segments doit correspondre
    if (count($route_parts) !== count($request_url_parts)) {
        return;
    }

    // Matching + paramètres
    $parameters = [];
    for ($i = 0; $i < count($route_parts); $i++) {

        $route_part = $route_parts[$i];

        // Paramètre dynamique
        if (preg_match('/^\$/', $route_part)) {
            $route_part = ltrim($route_part, '$');
            $parameters[] = $request_url_parts[$i];
            $$route_part = $request_url_parts[$i];
        }
        // Segment fixe
        else if ($route_parts[$i] !== $request_url_parts[$i]) {
            return;
        }
    }

    // Exécution callback ou inclusion
    if (is_callable($callback)) {
        call_user_func_array($callback, $parameters);
        exit();
    }

    include_once __DIR__ . "/$path_to_include";
    exit();
}


// Fonctions utilitaires
function out($text) { echo htmlspecialchars($text); }

function set_csrf()
{
    session_start();
    if (!isset($_SESSION["csrf"])) {
        $_SESSION["csrf"] = bin2hex(random_bytes(50));
    }
    echo '<input type="hidden" name="csrf" value="' . $_SESSION["csrf"] . '">';
}

function is_csrf_valid()
{
    session_start();
    if (!isset($_SESSION['csrf']) || !isset($_POST['csrf'])) return false;
    return $_SESSION['csrf'] === $_POST['csrf'];
}
