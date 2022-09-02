import { Point } from './point.js'
import { Line } from './line.js'

export class Maze {
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
                const wall = new VerticalWall(r, c, this)
                row.push(wall)
            }
            this.verticalWalls.push(row)
        }

        for (let r = 0; r < this.rows + 1; r++) {
            const row = []

            for (let c = 0; c < this.cols; c++) {
                const wall = new HorizontalWall(r, c, this)
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
        const unvisitedNeighbors = cell.getNeighbors()

        while (unvisitedNeighbors.length > 0) {
            const randId = Math.floor(Math.random() * unvisitedNeighbors.length)
            const randNeighbor = unvisitedNeighbors[randId]

            if (visited.has(randNeighbor)) {
                unvisitedNeighbors.splice(randId, 1)
                continue
            }

            cell.connect(randNeighbor)
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
    constructor(row, col, maze) {
        this.row = row
        this.col = col
        this.maze = maze
    }

    getNeighbors() {
        const neighbors = []
        const upRow = this.row - 1
        const downRow = this.row + 1
        const leftCol = this.col - 1
        const rightCol = this.col + 1

        if (leftCol >= 0) {
            neighbors.push(this.maze.getCell(this.row, leftCol))
        }
        if (rightCol < this.maze.cols) {
            neighbors.push(this.maze.getCell(this.row, rightCol))
        }
        if (upRow >= 0) {
            neighbors.push(this.maze.getCell(upRow, this.col))
        }
        if (downRow < this.maze.rows) {
            neighbors.push(this.maze.getCell(downRow, this.col))
        }

        return neighbors
    }

    connect(neighbor) {
        const dRow = this.row - neighbor.row
        const dCol = this.col - neighbor.col

        if (dRow > 0) {
            // up
            this.getTopWall().isOpen = true
        } else if (dRow < 0) {
            // down
            this.getBotWall().isOpen = true
        } else if (dCol > 0) {
            // left
            this.getLeftWall().isOpen = true
        } else {
            // right
            this.getRightWall().isOpen = true
        }
    }

    getTopWall() {
        return this.maze.getHorizontalWall(this.row, this.col)
    }

    getBotWall() {
        return this.maze.getHorizontalWall(this.row + 1, this.col)
    }

    getLeftWall() {
        return this.maze.getVerticalWall(this.row, this.col)
    }

    getRightWall() {
        return this.maze.getVerticalWall(this.row, this.col + 1)
    }

    draw(context) {
        const beginX = this.col * this.maze.cellSize
        const beginY = this.row * this.maze.cellSize
        context.fillRect(beginX, beginY, this.maze.cellSize, this.maze.cellSize)
    }
}

class Wall {
    constructor(row, col, maze, isOpen = false) {
        if (this.constructor.name === 'Wall') {
            throw new Error("Abstract classes can't be instantiated.")
        }
        this.row = row
        this.col = col
        this.maze = maze
    }
}

class VerticalWall extends Wall {
    constructor(row, col, maze, isOpen = false) {
        super(row, col, maze, isOpen)
        this.x = this.col * this.maze.cellSize
        this.beginY = this.row * this.maze.cellSize
        this.endY = this.beginY + this.maze.cellSize
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

    draw(context) {
        const x = this.col * this.maze.cellSize
        const beginY = this.row * this.maze.cellSize
        const endY = beginY + this.maze.cellSize
        context.beginPath()
        context.moveTo(x, beginY)
        context.lineTo(x, endY)
        context.stroke()
    }
}

class HorizontalWall extends Wall {
    constructor(row, col, maze, isOpen = false) {
        super(row, col, maze, isOpen)
        this.y = this.row * this.maze.cellSize
        this.beginX = this.col * this.maze.cellSize
        this.endX = this.beginX + this.maze.cellSize
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

    draw(context) {
        const y = this.row * this.maze.cellSize
        const beginX = this.col * this.maze.cellSize
        const endX = beginX + this.maze.cellSize
        context.beginPath()
        context.moveTo(beginX, y)
        context.lineTo(endX, y)
        context.stroke()
    }
}
