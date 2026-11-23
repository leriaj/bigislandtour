<?php
$hostname = "sql205.infinityfree.com";
$username = "if0_43441913";
$password = "ikj0rjeYq9xa";
$database = "if0_43441913_customers";

// Connect to the database
$conn = mysqli_connect($hostname, $username, $password, $database);

// Check if the connection worked
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>