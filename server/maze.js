const { Line } = require('./line.js')
const { Point } = require('./point.js')

class Maze {
    constructor(cellSize, rows, cols) {
        this.cellSize = cellSize
        this.rows = rows
        this.cols = cols
        this.width = cellSize * cols
        this.height = cellSize * rows
        this.cellColor = 'rgba(108, 122, 137, 1)'
        this.WallColor = 'rgba(108, 122, 137, 1)'
        this.cells = []
        this.verticalWalls = []
        this.horizontalWalls = []
        this.#initialize()
    }

    #initialize() {
        for (let r = 0; r < this.rows; r++) {
            const row = []

            for (let c = 0; c < this.cols; c++) {
                const cell = new Cell(r, c, this)
                row.push(cell)
            }
            this.cells.push(row)
        }

        for (let r = 0; r < this.rows; r++) {
            const row = []

            for (let c = 0; c < this.cols + 1; c++) {
                const wall = new VerticalWall(r, c, this.cellSize)
                row.push(wall)
            }
            this.verticalWalls.push(row)
        }

        for (let r = 0; r < this.rows + 1; r++) {
            const row = []

            for (let c = 0; c < this.cols; c++) {
                const wall = new HorizontalWall(r, c, this.cellSize)
                row.push(wall)
            }
            this.horizontalWalls.push(row)
        }

        const source = this.cells[0][0]
        const visited = new Set()
        visited.add(source)
        this.#dfs(source, visited)
        this.#openRandomInteriorWalls(0.25)
    }

    #dfs(cell, visited) {
        visited.add(cell)
        const unvisitedNeighbors = cell.getNeighbors(this)

        while (unvisitedNeighbors.length > 0) {
            const randId = Math.floor(Math.random() * unvisitedNeighbors.length)
            const randNeighbor = unvisitedNeighbors[randId]

            if (visited.has(randNeighbor)) {
                unvisitedNeighbors.splice(randId, 1)
                continue
            }

            cell.connect(this, randNeighbor)
            this.#dfs(randNeighbor, visited)
        }
    }

    #openRandomInteriorWalls(probability) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 1; c < this.cols; c++) {
                const wall = this.verticalWalls[r][c]
                if (wall.isOpen) {
                    continue
                }
                if (Math.random() < probability) {
                    wall.isOpen = true
                }
            }
        }

        for (let r = 1; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const wall = this.horizontalWalls[r][c]
                if (wall.isOpen) {
                    continue
                }
                if (Math.random() < probability) {
                    wall.isOpen = true
                }
            }
        }
    }

    getRandomSpawn(radius) {
        const row = Math.floor(Math.random() * this.rows)
        const col = Math.floor(Math.random() * this.cols)
        const minX = col * this.cellSize + radius
        const minY = row * this.cellSize + radius
        const range = this.cellSize - 2 * radius + 1
        const x = minX + Math.random() * range
        const y = minY + Math.random() * range
        return new Point(x, y)
    }

    getCell(row, col) {
        return this.cells[row][col]
    }

    getVerticalWall(row, col) {
        return this.verticalWalls[row][col]
    }

    getHorizontalWall(row, col) {
        return this.horizontalWalls[row][col]
    }

    getAllClosedWalls() {
        const walls = []

        for (let r = 0; r < this.rows; r++) {
            const row = this.verticalWalls[r]
            for (let c = 0; c < this.cols + 1; c++) {
                const wall = row[c]
                if (wall.isOpen) {
                    continue
                }
                walls.push(wall)
            }
        }

        for (let r = 0; r < this.rows + 1; r++) {
            const row = this.horizontalWalls[r]
            for (let c = 0; c < this.cols; c++) {
                const wall = row[c]
                if (wall.isOpen) {
                    continue
                }
                walls.push(wall)
            }
        }

        return walls
    }
}

class Cell {
    constructor(row, col) {
        this.row = row
        this.col = col
    }

    getNeighbors(maze) {
        const neighbors = []
        const upRow = this.row - 1
        const downRow = this.row + 1
        const leftCol = this.col - 1
        const rightCol = this.col + 1

        if (leftCol >= 0) {
            neighbors.push(maze.getCell(this.row, leftCol))
        }
        if (rightCol < maze.cols) {
            neighbors.push(maze.getCell(this.row, rightCol))
        }
        if (upRow >= 0) {
            neighbors.push(maze.getCell(upRow, this.col))
        }
        if (downRow < maze.rows) {
            neighbors.push(maze.getCell(downRow, this.col))
        }

        return neighbors
    }

    connect(maze, neighbor) {
        const dRow = this.row - neighbor.row
        const dCol = this.col - neighbor.col

        if (dRow > 0) {
            // up
            this.getTopWall(maze).isOpen = true
        } else if (dRow < 0) {
            // down
            this.getBotWall(maze).isOpen = true
        } else if (dCol > 0) {
            // left
            this.getLeftWall(maze).isOpen = true
        } else {
            // right
            this.getRightWall(maze).isOpen = true
        }
    }

    getTopWall(maze) {
        return maze.getHorizontalWall(this.row, this.col)
    }

    getBotWall(maze) {
        return maze.getHorizontalWall(this.row + 1, this.col)
    }

    getLeftWall(maze) {
        return maze.getVerticalWall(this.row, this.col)
    }

    getRightWall(maze) {
        return maze.getVerticalWall(this.row, this.col + 1)
    }
}

class Wall {
    constructor(row, col, length, isOpen = false) {
        if (this.constructor.name === 'Wall') {
            throw new Error("Abstract classes can't be instantiated.")
        }
        this.row = row
        this.col = col
        this.length = length
        this.isOpen = isOpen
    }
}

class VerticalWall extends Wall {
    constructor(row, col, length, isOpen = false) {
        super(row, col, length, isOpen)
        this.x = this.col * this.length
        this.beginY = this.row * this.length
        this.endY = this.beginY + this.length
    }

    getEndPoints() {
        return [new Point(this.x, this.beginY), new Point(this.x, this.endY)]
    }

    getLines() {
        return new Line(
            new Point(this.x, this.beginY),
            new Point(this.x, this.endY)
        )
    }
}

class HorizontalWall extends Wall {
    constructor(row, col, length, isOpen = false) {
        super(row, col, length, isOpen)
        this.y = this.row * this.length
        this.beginX = this.col * this.length
        this.endX = this.beginX + this.length
    }

    getEndPoints() {
        return [new Point(this.beginX, this.y), new Point(this.endX, this.y)]
    }

    getLines() {
        return new Line(
            new Point(this.beginX, this.y),
            new Point(this.endX, this.y)
        )
    }
}

module.exports = {
    Maze
}
