const { Line } = require('./line.js')
const { Point } = require('./point.js')

class Maze {
    constructor(cellSize, rows, cols) {
        this.cellSize = cellSize
        this.rows = rows
        this.cols = cols
        this.cellColor = 'rgba(255, 255, 255, 0.1)'
        this.WallColor = 'black'
        this.cells = []
        this.verticalWalls = []
        this.horizontalWalls = []
        this.initialize()
    }

    initialize() {
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
        this.dfs(source, visited)

        for (const wall of this.getAllClosedWalls()) {
            if (Math.random() > 0.75) {
                wall.isOpen = true
            }
        }
    }

    dfs(cell, visited) {
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
            this.dfs(randNeighbor, visited)
        }
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

    draw(context) {
        this.drawCells(context)
        this.drawVerticalWalls(context)
        this.drawHorizontalWalls(context)
    }

    drawCells(context) {
        context.fillStyle = this.cellColor

        for (let r = 0; r < this.rows; r++) {
            const row = this.cells[r]
            for (let c = 0; c < this.cols; c++) {
                const cell = row[c]
                cell.draw(context)
            }
        }
    }

    drawVerticalWalls(context) {
        context.strokeStyle = this.WallColor

        for (let r = 0; r < this.rows; r++) {
            const row = this.verticalWalls[r]
            for (let c = 0; c < this.cols + 1; c++) {
                const wall = row[c]
                if (wall.isOpen) {
                    continue
                }
                wall.draw(context)
            }
        }
    }

    drawHorizontalWalls(context) {
        context.strokeStyle = this.WallColor

        for (let r = 0; r < this.rows + 1; r++) {
            const row = this.horizontalWalls[r]
            for (let c = 0; c < this.cols; c++) {
                const wall = row[c]
                if (wall.isOpen) {
                    continue
                }
                wall.draw(context)
            }
        }
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
