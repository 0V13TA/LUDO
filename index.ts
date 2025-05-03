//#region Variables, Functions and Type Definitions

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

const staringTiles: startingTiles = {
  green: null,
  yellow: null,
  red: null,
  blue: null,
  white: null,
};
let noOfPlayer = 4;

const get2randInt = (): [number, number] => [
  Math.floor(Math.random() * 6 + 1),
  Math.floor(Math.random() * 6 + 1),
];
let isPlaying = false;
let randNumbs: [number, number] = [1, 1];

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
  constructor(x: number, y: number, color: colors) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = sizeOfHomes.width;
    this.height = sizeOfHomes.height;
    this.border = 20;
    this.name = this.color === "green" && noOfPlayer === 3 ? "white" : color;
    this.discX = 50;
    this.discY = 60;
    switch (this.color) {
      case "green":
        this.discColor = "#00ff00";
        break;
      case "blue":
        this.discColor = "#11b9f1";
        break;
      case "yellow":
        this.discColor = "#ffff00d5";
        break;
      case "red":
        this.discColor = "#ff4800";
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
}
class Disc {
  constructor(x: number, y: number, color: string, house: colors) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.house = house;
    this.isOutOfHouse = false;
    this.currentTile = staringTiles[house];
    this.radius = sizeOfTile.height / 2 - 2;
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

  move(times: number) {
    if (times > 6 || times < 1) {
      console.log(
        "Number Of Times must not be less than 1 and must not be greater than 6"
      );
    }

    this.decideNextTileForSpecialTiles();

    for (let i = 0; i < times; i++) {
      if (this.currentTile !== null) {
        this.x = this.currentTile.x + this.radius;
        this.y = this.currentTile.y + this.radius;
        this.currentTile = this.currentTile.nextTile;
        this.draw();
      }
    }
  }
}

//#endregion

//#region Initializations

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
        tile.color = "white";
        specialTiles.push(tile);
      }

      if (j === 5) {
        rightTiles[i][j].color = "white";
        topTiles[i][j].color = "white";
        bottomTiles[i][j].color = "white";
        specialTiles.push(rightTiles[i][j], topTiles[i][j], bottomTiles[i][j]);
        tile.nextTile = null;
        rightTiles[i][j].nextTile = null;
        topTiles[i][j].nextTile = null;
        bottomTiles[i][j].nextTile = null;
      }
    }

    if (i === 0) {
      if (j === 5) {
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

const HOMES = [
  new Home(0, 0, "green"),
  new Home(0, canvas.height - sizeOfHomes.height, "yellow"),
  new Home(canvas.width - sizeOfHomes.width, 0, "red"),
  new Home(
    canvas.width - sizeOfHomes.width,
    canvas.height - sizeOfHomes.height,
    "blue"
  ),
];
HOMES.forEach((home) => home.draw());
const heaven = new Heaven();

heaven.draw();

HOMES[1].discs[1].move(56);
specialTiles.forEach((tile) => {
  if (tile.disc !== null && tile.house === tile.disc.house) {
    switch (tile.house) {
      case "blue":
        tile.nextTile = rightTiles[1][4];
        break;
      case "yellow":
        tile.nextTile = bottomTiles[1][4];
        break;
      case "red":
        tile.nextTile = topTiles[1][4];
        break;
      default:
        tile.nextTile = leftTiles[1][1];
        break;
    }
  }
});

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
    console.log(rand, rand1);
  }
});

//#endregion
