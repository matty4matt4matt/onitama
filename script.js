document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const player1CardsElement = document.getElementById('player1-cards');
    const player2CardsElement = document.getElementById('player2-cards');
    const currentPlayerElement = document.getElementById('current-player');
    const winnerBox = document.getElementById('winner-box');
    const winnerMessage = document.getElementById('winner-message');
    const closeButton = document.getElementById('close-button');

    const boardSize = 5;

    const movementCards = [
        {
            name: "Tiger",
            pattern: [
                [-2, 0],
                [1, 0],
            ],
        },
        {
            name: "Dragon",
            pattern: [
                [-1, -2],
                [-1, 2],
                [1, -1], 
                [1, 1],
            ],
        },
    ];

    const player1Cards = [movementCards[0], movementCards[1]];
    const player2Cards = [movementCards[0], movementCards[1]];

    let selectedCard = null;

    player1Cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.textContent = card.name;
        cardElement.classList.add('card');
        cardElement.dataset.card = JSON.stringify(card);
        cardElement.addEventListener('click', () => selectCard(cardElement));
        player1CardsElement.appendChild(cardElement);
    });

    player2Cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.textContent = card.name;
        cardElement.classList.add('card');
        cardElement.dataset.card = JSON.stringify(card);
        cardElement.addEventListener('click', () => selectCard(cardElement));
        player2CardsElement.appendChild(cardElement);
    });

    const board = [];
    let selectedPiece = null;
    let currentPlayer = 'Player 1';

    for (let row = 0; row < boardSize; row++) {
        const rowArray = [];
        for (let col = 0; col < boardSize; col++) {
            const square = document.createElement('div');
            square.dataset.row = row;
            square.dataset.col = col;
            square.classList.add('square');

            if (row === 0 || row === boardSize - 1) {
                const isMaster = col === 2;
                const piece = {
                    type: isMaster ? 'Master' : 'Student',
                    player: row === 0 ? 'Player 1' : 'Player 2',
                };
                square.textContent = isMaster ? 'M' : 'S';
                square.classList.add(piece.player.replace(' ', '-').toLowerCase());
                square.dataset.piece = JSON.stringify(piece);
            }

            square.addEventListener('click', handleSquareClick);
            boardElement.appendChild(square);
            rowArray.push(square);
        }
        board.push(rowArray);
    }

    function updateTurnDisplay() {
        currentPlayerElement.textContent = `Current Turn: ${currentPlayer}`;
    }

    function clearAvailableMoves() {
        board.flat().forEach(square => {
            square.classList.remove('available-move');
        });
    }

    function showAvailableMoves(piece, row, col) {
        clearAvailableMoves();
        if (!selectedCard) return;
        const card = JSON.parse(selectedCard.dataset.card);

        card.pattern.forEach(move => {
            const newRow = parseInt(row) + move[0];
            const newCol = parseInt(col) + move[1];

            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                const targetSquare = board[newRow][newCol];
                if (!targetSquare.dataset.piece || JSON.parse(targetSquare.dataset.piece).player !== currentPlayer) {
                    targetSquare.classList.add('available-move');
                }
            }
        });
    }

    function selectPiece(square) {
        const piece = JSON.parse(square.dataset.piece);

        if (piece.player === currentPlayer) {
            if (selectedPiece) {
                selectedPiece.classList.remove('selected');
                clearAvailableMoves();
            }

            selectedPiece = square;
            selectedPiece.classList.add('selected');
            showAvailableMoves(piece, square.dataset.row, square.dataset.col);
        }
    }

    function movePiece(square) {
        if (selectedPiece && square.classList.contains('available-move')) {
            const targetPiece = square.dataset.piece ? JSON.parse(square.dataset.piece) : null;

            // Capture logic for opponent piece
            if (targetPiece && targetPiece.player !== currentPlayer) {
                square.textContent = '';
                square.className = 'square';
                square.dataset.piece = '';
            }

            // Move the piece to the new square
            square.textContent = selectedPiece.textContent;
            const playerClass = selectedPiece.classList.contains('player-1') ? 'player-1' : 'player-2';
            square.className = `square ${playerClass}`;
            square.dataset.piece = selectedPiece.dataset.piece;

            // Clear the old square
            selectedPiece.textContent = '';
            selectedPiece.className = 'square';
            selectedPiece.dataset.piece = '';

            if (checkForVictory()) {
                displayWinner(currentPlayer);
                return;
            }

            selectedPiece = null;
            clearAvailableMoves();

            // Switch player turn
            currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
            updateTurnDisplay();

            // If it's the AI's turn
            if (currentPlayer === 'Player 2') {
                aiTurn();
            }
        }
    }

    function checkForVictory() {
        let player1HasPieces = false;
        let player2HasPieces = false;

        board.flat().forEach(square => {
            const piece = square.dataset.piece ? JSON.parse(square.dataset.piece) : null;
            if (piece) {
                if (piece.player === 'Player 1') player1HasPieces = true;
                if (piece.player === 'Player 2') player2HasPieces = true;
            }
        });

        return !player1HasPieces || !player2HasPieces;
    }

    function displayWinner(winner) {
        winnerMessage.textContent = `${winner} Wins!`;
        winnerBox.style.display = 'block';
    }

    closeButton.addEventListener('click', () => {
        winnerBox.style.display = 'none';
    });

    function handleSquareClick(event) {
        const square = event.currentTarget;

        if (selectedPiece) {
            movePiece(square);
        } else if (square.dataset.piece) {
            selectPiece(square);
        }
    }

    function selectCard(cardElement) {
        if (selectedCard) {
            selectedCard.classList.remove('selected-card');
        }

        selectedCard = cardElement;
        selectedCard.classList.add('selected-card');
        console.log(`Selected card: ${selectedCard.textContent}`);

        if (selectedPiece) {
            showAvailableMoves(JSON.parse(selectedCard.dataset.card), selectedPiece.dataset.row, selectedPiece.dataset.col);
        }
    }
    
    function aiTurn() {
        // AI movement logic goes here
        const validMoves = [];
        board.flat().forEach(square => {
            const piece = square.dataset.piece ? JSON.parse(square.dataset.piece) : null;
            if (piece && piece.player === 'Player 2') {
                const row = square.dataset.row;
                const col = square.dataset.col;
                const card = selectedCard ? JSON.parse(selectedCard.dataset.card) : null;
                if (card) {
                    card.pattern.forEach(move => {
                        const newRow = parseInt(row) + move[0];
                        const newCol = parseInt(col) + move[1];
                        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                            const targetSquare = board[newRow][newCol];
                            if (!targetSquare.dataset.piece || JSON.parse(targetSquare.dataset.piece).player !== 'Player 2') {
                                validMoves.push({ piece: square, target: targetSquare });
                            }
                        }
                    });
                }
            }
        });

        // Randomly select a valid move
        if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            selectPiece(randomMove.piece);
            movePiece(randomMove.target);
        }
    }

    updateTurnDisplay();
});
