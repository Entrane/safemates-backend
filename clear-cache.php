<?php
// Script pour vider le cache OPcache de PHP
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "OPcache vidé avec succès!";
} else {
    echo "OPcache n'est pas activé";
}
?>
