//#region Variables and Type Definitions

type startingTiles = {
  green: Tile | null;
  yellow: Tile | null;
  red: Tile | null;
  blue: Tile | null;
  white: null;
};

type colors = "green" | "red" | "yellow" | "blue" | "white";

const canvas = document.createElement("canvas");
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.width = innerWidth * 0.8;
canvas.height = innerHeight * 0.7;
const center = { x: canvas.width / 2, y: canvas.height / 2 };
const sizeOfHomes = { width: canvas.width * 0.4, height: canvas.height * 0.4 };
const sizeOfTile = {
  width: sizeOfHomes.width / 6,
  height: (canvas.height * 0.2) / 3,
};

const leftTiles: [Tile[], Tile[], Tile[]] = [[], [], []];
const rightTiles: [Tile[], Tile[], Tile[]] = [[], [], []];
const topTiles: [Tile[], Tile[], Tile[]] = [[], [], []];
const bottomTiles: [Tile[], Tile[], Tile[]] = [[], [], []];
const specialTiles: Tile[] = [];
let animation = null;

const staringTiles: startingTiles = {
  green: null,
  yellow: null,
  red: null,
  blue: null,
  white: null,
};
let noOfPlayer = 4;

const currentPlayerSpan = document.querySelector("span#currentPlayer");

let isPlaying = false;
let randNumbs: [number, number] = [0, 0];
let numberOfPlayers = 4;
let players: colors[] = [];
let currentPlayer: colors | null = null;

//#endregion

//#region Classes

interface Home {
  x: number;
  y: number;
  color: colors;
  width: number;
  height: number;
  border: number;
  name: string;
  discX: number;
  discY: number;
  discs: Disc[];
  discColor: string;
  startingTile: Tile | null;
  draw(): void;
}
class Home {
  constructor(x: number, y: number, color: colors, name: string = color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = sizeOfHomes.width;
    this.height = sizeOfHomes.height;
    this.border = 20;
    this.name = name;
    this.discX = 50;
    this.discY = 60;
    switch (this.color) {
      case "green":
        this.discColor = "#00ff00";
        break;
      case "blue":
        this.discColor = "#0050ff";
        break;
      case "yellow":
        this.discColor = "#ffff00";
        break;
      case "red":
        this.discColor = "#ff0000";
        break;

      default:
        this.discColor = this.color;
        break;
    }
    this.startingTile = null;
    this.discs = [
      new Disc(
        this.x + this.discX,
        this.y + this.discY,
        this.discColor,
        this.color
      ),
      new Disc(
        this.x + this.width - this.discX,
        this.y + this.discY,
        this.discColor,
        this.color
      ),
      new Disc(
        this.x + this.discX,
        this.y + this.height - this.discY,
        this.discColor,
        this.color
      ),
      new Disc(
        this.x + this.width - this.discX,
        this.y + this.height - this.discY,
        this.discColor,
        this.color
      ),
    ];
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(
      this.x + this.border / 2,
      this.y + this.border / 2,
      this.width - this.border,
      this.height - this.border
    );
    ctx.fill();
    ctx.closePath();
    this.discs.forEach((disc) => disc.draw());
  }
}

interface Heaven {
  x: number;
  y: number;
  color: string;
  width: number;
  height: number;
  draw(): void;
}
class Heaven {
  constructor() {
    this.width = canvas.width * 0.2;
    this.height = canvas.height * 0.2;
    this.x = center.x - this.width / 2;
    this.y = center.y - this.height / 2;
    this.color = "pink";
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.font = "27px sans-serif";
    ctx.fillText("LUDO", center.x - 37, center.y + 9);
    ctx.closePath();
  }
}

interface Tile {
  x: number;
  y: number;
  color: colors;
  width: number;
  height: number;
  nextTile: Tile | null;
  disc: Disc | null;
  house: colors;
  draw(): void;
}
class Tile {
  constructor(x: number, y: number, color: colors, nextTile: Tile | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.height = sizeOfTile.height;
    this.width = sizeOfTile.width;
    this.nextTile = nextTile;
    this.disc = null;
    this.house = "white";
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "black";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}

interface Disc {
  x: number;
  y: number;
  radius: number;
  color: string;
  house: colors;
  currentTile: Tile | null;
  isOutOfHouse: boolean;
  draw(): void;
  updateGameState(e: MouseEvent): void;
}
class Disc {
  constructor(x: number, y: number, color: string, house: colors) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.house = house;
    this.isOutOfHouse = false;
    this.currentTile = staringTiles[house];
    this.radius = sizeOfTile.height / 2 - 4;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "black";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }

  private decideNextTileForSpecialTiles() {
    if (this.currentTile !== null) {
      this.isOutOfHouse = true;
      this.currentTile.disc = this;

      if (specialTiles.includes(this.currentTile)) {
        if (
          this.currentTile.disc !== null &&
          this.currentTile.house === this.house
        ) {
          switch (this.house) {
            case "blue":
              this.currentTile.nextTile = rightTiles[1][4];
              break;
            case "yellow":
              this.currentTile.nextTile = bottomTiles[1][4];
              break;
            case "red":
              this.currentTile.nextTile = topTiles[1][4];
              break;
            case "green":
              this.currentTile.nextTile = leftTiles[1][1];
              break;
          }
        }
      }
    }
  }

  move() {
    this.decideNextTileForSpecialTiles();
    if (this.currentTile !== null) {
      this.x = this.currentTile.x + sizeOfTile.width / 2;
      this.y = this.currentTile.y + sizeOfTile.height / 2;
      this.currentTile = this.currentTile.nextTile;
      this.draw();
    }
  }

  updateGameState(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if the click is within the disc's boundaries
    if (
      clickX >= this.x - this.radius &&
      clickX <= this.x + this.radius &&
      clickY >= this.y - this.radius &&
      clickY <= this.y + this.radius &&
      currentPlayer === this.house
    ) {
      // Move the disc based on the dice roll
      for (let i = 0; i < randNumbs[0]; i++) {
        this.move();
      }

      // Redraw the game board after the disc has moved
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      drawTiles(); // Redraw all tiles
      homes.forEach((home) => home.draw()); // Redraw all homes

      // Reset the dice values
      randNumbs = [0, 0];

      currentPlayer =
        players[(players.indexOf(currentPlayer) + 1) % players.length];
      currentPlayerSpan!.textContent = currentPlayer;
    }
  }
}

//#endregion

//#region Initializations

// This code should come before you initialize the homes.
generateTiles();
drawTiles();

let homes: Home[] = [];

switch (numberOfPlayers) {
  case 4:
    homes = [
      new Home(0, 0, "green"),
      new Home(0, canvas.height - sizeOfHomes.height, "yellow"),
      new Home(canvas.width - sizeOfHomes.width, 0, "red"),
      new Home(
        canvas.width - sizeOfHomes.width,
        canvas.height - sizeOfHomes.height,
        "blue"
      ),
    ];
    players = ["green", "yellow", "red", "blue"];
    currentPlayer = players[0];
    currentPlayerSpan!.textContent = currentPlayer;
    break;

  case 3:
    homes = [
      new Home(0, 0, "green", "white"),
      new Home(0, canvas.height - sizeOfHomes.height, "yellow"),
      new Home(canvas.width - sizeOfHomes.width, 0, "red"),
      new Home(
        canvas.width - sizeOfHomes.width,
        canvas.height - sizeOfHomes.height,
        "blue"
      ),
    ];
    players = ["yellow", "red", "blue"];
    currentPlayer = players[0];
    currentPlayerSpan!.textContent = currentPlayer;
    break;

  case 2:
    homes = [
      new Home(0, 0, "green", "green"),
      new Home(0, canvas.height - sizeOfHomes.height, "yellow", "blue"),
      new Home(canvas.width - sizeOfHomes.width, 0, "red", "green"),
      new Home(
        canvas.width - sizeOfHomes.width,
        canvas.height - sizeOfHomes.height,
        "blue",
        "blue"
      ),
    ];
    players = ["green", "blue"];
    currentPlayer = players[0];
    currentPlayerSpan!.textContent = currentPlayer;
    break;

  default:
    throw new Error("Number of players cannot be less than 2");
}

homes.forEach((home) => home.draw());
const heaven = new Heaven();

heaven.draw();

//#endregion

//#region EventListners

document.querySelector("button#roll")?.addEventListener("click", () => {
  if (!isPlaying) {
    const time = setInterval(() => {
      const [rand, rand1] = get2randInt();
      document
        .querySelectorAll("li.selected")
        .forEach((el) => el.classList.remove("selected"));
      document
        .querySelector(`ul.firstDie li#id${rand}`)
        ?.classList.add("selected");
      document
        .querySelector(`ul.secondDie li#id${rand1}`)
        ?.classList.add("selected");
    }, 10);

    const [rand, rand1] = get2randInt();
    setTimeout(() => {
      clearInterval(time);
      document
        .querySelectorAll("li.selected")
        .forEach((el) => el.classList.remove("selected"));
      document
        .querySelector(`ul.firstDie li#id${rand}`)
        ?.classList.add("selected");
      document
        .querySelector(`ul.secondDie li#id${rand1}`)
        ?.classList.add("selected");
    }, 500);
    randNumbs = [rand, rand1];
  }
});

addEventListener("click", (e) => {
  homes.forEach((home) => {
    home.discs.forEach((disc) => {
      disc.updateGameState(e);
      drawTiles();
      drawTiles();
      homes.forEach((home) => home.draw());
    });
  });
});

//#endregion

//#region Functions

function get2randInt(): [number, number] {
  return [Math.floor(Math.random() * 6 + 1), Math.floor(Math.random() * 6 + 1)];
}

function generateTiles() {
  for (let i = 0; i < 3; i++) {
    let xCoord = 0,
      yCoord = sizeOfHomes.height;
    let xCoord1 = sizeOfHomes.width + 3 * sizeOfTile.width,
      yCoord1 = sizeOfHomes.height;
    for (let j = 0; j < 6; j++) {
      leftTiles[i].push(
        new Tile(xCoord, yCoord + i * sizeOfTile.height, "white", null)
      );
      rightTiles[i].push(
        new Tile(xCoord1, yCoord1 + i * sizeOfTile.height, "white", null)
      );
      xCoord += sizeOfTile.width;
      xCoord1 += sizeOfTile.width;
    }
  }

  for (let i = 0; i < 3; i++) {
    let xCoord = sizeOfHomes.width,
      yCoord = sizeOfHomes.height - sizeOfTile.height;
    let xCoord1 = sizeOfHomes.width,
      yCoord1 = sizeOfHomes.height + 3 * sizeOfTile.height;
    for (let j = 0; j < 6; j++) {
      topTiles[i].push(
        new Tile(xCoord + i * sizeOfTile.width, yCoord, "white", null)
      );
      bottomTiles[i].push(
        new Tile(xCoord1 + i * sizeOfTile.width, yCoord1, "white", null)
      );
      yCoord -= sizeOfTile.height;
      yCoord1 += sizeOfTile.height;
    }
  }
}

function drawTiles() {
  leftTiles.forEach((row, i) => {
    row.forEach((tile, j) => {
      if (j === 4 || j === 1) {
        if (j === 1 && i === 0) tile.color = "green";
        if (j === 4 && i === 0) bottomTiles[i][j].color = "yellow";
        if (i === 2 && j === 4) {
          rightTiles[i][j].color = "blue";
          topTiles[i][j].color = "red";
        }
      }

      if (i === 1) {
        tile.color = "green";
        rightTiles[i][j].color = "blue";
        topTiles[i][j].color = "red";
        bottomTiles[i][j].color = "yellow";

        tile.nextTile = leftTiles[i][j + 1];
        rightTiles[i][j].nextTile = rightTiles[i][j - 1];
        topTiles[i][j].nextTile = topTiles[i][j - 1];
        bottomTiles[i][j].nextTile = bottomTiles[i][j - 1];

        if (j === 0) {
          // Setting the special tiles to white
          tile.color = "white";

          specialTiles.push(tile);
          // Setting the last tiles to null
          rightTiles[i][j].nextTile = null;
          topTiles[i][j].nextTile = null;
          bottomTiles[i][j].nextTile = null;
        }

        if (j === 5) {
          // Setting the special tiles to white
          rightTiles[i][j].color = "white";
          topTiles[i][j].color = "white";
          bottomTiles[i][j].color = "white";

          specialTiles.push(
            rightTiles[i][j],
            topTiles[i][j],
            bottomTiles[i][j]
          );
          // Setting the last tile of the left tile to null
          tile.nextTile = null;
        }
      }

      if (i === 0) {
        if (j === 5) {
          // Setting the next tiles of the last tiles of a column
          // So the disc can move correctly.
          tile.nextTile = topTiles[i][0];
          topTiles[i][j].nextTile = topTiles[1][j];
          rightTiles[i][j].nextTile = rightTiles[1][j];
          bottomTiles[i][j].nextTile = bottomTiles[i][j - 1];
        } else {
          tile.nextTile = leftTiles[i][j + 1];
          topTiles[i][j].nextTile = topTiles[i][j + 1];
          rightTiles[i][j].nextTile = rightTiles[i][j + 1];
          bottomTiles[i][j].nextTile =
            j === 0 ? leftTiles[2][5] : bottomTiles[i][j - 1];
        }

        if (j === 1) staringTiles.green = tile;
        if (j === 4) staringTiles.yellow = bottomTiles[i][j];
      }

      if (i === 1) {
        // Setting the next tile special tiles of
        // each house to the correct tile
        leftTiles[i][0].nextTile = leftTiles[0][0];
        topTiles[i][5].nextTile = topTiles[2][5];
        rightTiles[i][5].nextTile = rightTiles[2][5];
        bottomTiles[i][5].nextTile = bottomTiles[0][5];
      }

      if (i === 2) {
        if (j === 0) {
          tile.nextTile = leftTiles[1][0];
          topTiles[i][j].nextTile = rightTiles[0][0];
          rightTiles[i][j].nextTile = bottomTiles[2][0];
          bottomTiles[i][j].nextTile = bottomTiles[i][j + 1];
        } else if (j === 5) {
          tile.nextTile = leftTiles[i][j - 1];
          topTiles[i][j].nextTile = topTiles[i][j - 1];
          rightTiles[i][j].nextTile = rightTiles[i][j - 1];
          bottomTiles[i][j].nextTile = bottomTiles[1][5];
        } else {
          tile.nextTile = leftTiles[i][j - 1];
          topTiles[i][j].nextTile = topTiles[i][j - 1];
          rightTiles[i][j].nextTile = rightTiles[i][j - 1];
          bottomTiles[i][j].nextTile = bottomTiles[i][j + 1];
        }

        if (j === 4) {
          staringTiles.red = topTiles[i][j];
          staringTiles.blue = rightTiles[i][j];
        }
      }

      tile.house = "green";
      rightTiles[i][j].house = "blue";
      topTiles[i][j].house = "red";
      bottomTiles[i][j].house = "yellow";

      tile.draw();
      rightTiles[i][j].draw();
      topTiles[i][j].draw();
      bottomTiles[i][j].draw();
    });
  });
}

//#endregion

animation = setInterval(() => {
  homes.forEach((home) => home.draw());
}, 500);
