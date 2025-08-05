<?php
if (getenv('DOCKER_ENV') || $_SERVER['HTTP_HOST'] !== 'localhost') {
    // ---- Interface pour Azure/Docker ----
    interface Config {
        const DB_HOST = "mysql";            // service MySQL du docker-compose
        const DB_USER = "clinique_user";
        const DB_PWD  = "motdepassefort";
        const DB_NAME = "clinique_db";
    }
} else {
    // ---- Interface pour localhost ----
    interface Config {
        const DB_HOST = "database:3306"; 
        const DB_USER = "root";
        const DB_PWD  = "tiger";      // ton mot de passe local
        const DB_NAME = "docker";     // nom de ta base locale
    }
}
?>
