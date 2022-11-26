<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>Life</title>
	<link rel="stylesheet" href="css/style.css?v<?= time() ?>">
	<script src="js/component.js?v=<?= time() ?>"></script>
	<script src="js/life-game.js?v=<?= time() ?>"></script>
	<script src="js/cell.js?v=<?= time() ?>"></script>
	<script src="js/main.js?v=<?= time() ?>"></script>
</head>
<body>
<div class="container">
	<div class="row">
		<div class="col-12">
			<h3 class="mt-3 mb-3">Игра Жизнь</h3>
		</div>
	</div>
	<div class="row">
		<div class="col-3">
			<label>Размер ячеек</label>
			<input class="form-control" type="number" id="life-game-cell-size" min="1" max="50" value="15">
		</div>
		<div class="col-3">
			<label>Кол-во ячеек по ширине</label>
			<input class="form-control" type="number" id="life-game-width" min="1" value="50">
		</div>
		<div class="col-3">
			<label>Кол-во ячеек по высоте</label>
			<input class="form-control" type="number" id="life-game-height" min="1" value="20">
		</div>
			<div class="col-3">
			<label>Скорость игры</label>
			<input class="form-control" type="number" id="life-game-speed" value="3" min="1" max="30">
		</div>
	</div>
	<div class="row">
		<div class="col-12 text-center">
			<button class="btn btn-success" id="life-game-generate">Сгенерировать</button>
		</div>
	</div>
	<div class="row">
		<div class="col-3 text-center p-4">
			<button class="btn btn-success" id="life-game-start">Старт</button>
		</div>
		<div class="col-3 text-center p-4">
			<button class="btn btn-warning" id="life-game-pause">Пауза</button>
		</div>
		<div class="col-3 text-center p-4">
			<button class="btn btn-danger" id="life-game-stop">Стоп</button>
		</div>
		<div class="col-3 text-center p-4">
			<button class="btn btn-danger" id="life-game-clear">Очистить</button>
		</div>
	</div>
	<div class="row">
		<div class="col-12 text-center pt-3">
			<canvas class="life-game__canvas" id="life-game-canvas"></canvas>
		</div>
	</div>
	<div class="row">
		<div class="col-12" id="info"></div>
	</div>
	<div class="row">
		<div class="col-12" id="result"></div>
	</div>
</div>
<script>
	document.addEventListener('DOMContentLoaded', createGame);
</script>
</body>
</html>