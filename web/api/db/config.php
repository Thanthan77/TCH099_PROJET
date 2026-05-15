<?php
interface Config {
    const DB_HOST = getenv('DB_HOST');
    const DB_PORT = getenv('DB_PORT');
    const DB_NAME = getenv('DB_NAME');
    const DB_USER = getenv('DB_USER');
    const DB_PWD  = getenv('DB_PWD');
}
