<!DOCTYPE html>
<html><head>
		<meta charset="UTF-8">
		</head>
<body>
<?php
$username = $_POST["username"];
$map = $_POST["map"];
$player = $_POST["player"];
$opposing = $_POST["opposing"];
$assist = $_POST["assist"];
$side = $_POST["side"];
$mode = $_POST["mode"];
$playerLocation = $_POST["playerX"] . "x" . $_POST["playerY"] ."x" . $_POST["playerZ"];
$enemyLocation = $_POST["enemyX"] . "x" . $_POST["enemyY"] ."x" . $_POST["enemyZ"];
$method = $_POST["method"];
$game = $_POST["game"];

if (!file_exists("data/".$username)) {
	mkdir("data/".$username);
}
if (!file_exists("data/".$username."/data.csv")) {
	$data = fopen("data/".$username."/data.csv", "w+");
	fputcsv($data, array("map", "side", "mode", "playerCharacter", "opposingCharacter", "assistCharacter", "playerLocation", "enemyLocation", "method", "game"));
	fclose($data);
}
$data = fopen("data/".$username."/data.csv", "a");
fputcsv($data, array($map, $side, $mode, $player, $opposing, $assist, $playerLocation, $enemyLocation, $method, $game)); 
fclose($data);
?>
</body>
</html>