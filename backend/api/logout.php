<?php
/**
 * Logout API
 * POST /api/logout
 */

global $conn;
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Destroy session
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_unset();
        session_destroy();
    }
    
    sendResponse('success', 'Logged out successfully');
} else {
    sendResponse('error', 'Method not allowed');
}
?>


