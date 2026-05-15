#!/bin/bash
cp /home/site/wwwroot/nginx.conf /etc/nginx/sites-enabled/default
nginx -s reload || service nginx restart
