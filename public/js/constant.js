const GAME_WIDTH = window.screen.width * window.devicePixelRatio;
const GAME_HEIGHT = window.screen.height * window.devicePixelRatio;
const PITCH_X = GAME_WIDTH / 12;
const PITCH_Y = GAME_HEIGHT / 16;
const SCALE_BALL = GAME_HEIGHT / 40 / 256;
const SCALE_PLAYER = GAME_HEIGHT / 34 / 100;
const STADIUM_WIDTH = GAME_WIDTH - PITCH_X * 2;
const STADIUM_HEIGHT = GAME_HEIGHT - PITCH_Y * 2;
const STRAIGHT_PLAYER_SPEED = GAME_WIDTH / 7;
const DIAGONAL_PLAYER_SPEED = STRAIGHT_PLAYER_SPEED/2 * Math.sqrt(2);
const STRAIGHT_BALL_SPEED = GAME_WIDTH / 3.4;
const DIAGONAL_BALL_SPEED = STRAIGHT_BALL_SPEED/2 * Math.sqrt(2);
const WIDTH_PLAYER = 100 * SCALE_PLAYER;
const WIDTH_BALL = 256 * SCALE_BALL;
const SCALE_CORN = GAME_HEIGHT / 20 / 250;
const SCALE_CENTER_CIRCLE = GAME_HEIGHT / 4 / 500;
const SCALE_GOAL = GAME_HEIGHT / 4 / 149;
const CAM_SCALE = 1.25;
const TEAM_POSITION = {
    "blue": [
        {x: 3 / 8 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT / 2 - WIDTH_PLAYER / 2},
        {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT / 2 - WIDTH_PLAYER / 2},
        {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: PITCH_Y + 1/8 * STADIUM_HEIGHT},
        {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/8 * STADIUM_HEIGHT - WIDTH_PLAYER },
        {x: 1 / 8 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/4 * STADIUM_HEIGHT - WIDTH_PLAYER },
        {x: 1 / 8 * STADIUM_WIDTH + PITCH_X, y: PITCH_Y + 1/4 * STADIUM_HEIGHT},
    ],
    "red": [
        {x: GAME_WIDTH - WIDTH_PLAYER -  3 / 8 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT / 2 - WIDTH_PLAYER / 2},
        {x: GAME_WIDTH - WIDTH_PLAYER - 1 / 4 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT / 2 - WIDTH_PLAYER / 2},
        {x: GAME_WIDTH - WIDTH_PLAYER- 1 / 4 * STADIUM_WIDTH - PITCH_X, y: PITCH_Y + 1/8 * STADIUM_HEIGHT},
        {x: GAME_WIDTH - WIDTH_PLAYER - 1 / 4 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/8 * STADIUM_HEIGHT - WIDTH_PLAYER },
        {x: GAME_WIDTH - WIDTH_PLAYER - 1 / 8 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/4 * STADIUM_HEIGHT - WIDTH_PLAYER },
        {x: GAME_WIDTH - WIDTH_PLAYER - 1 / 8 * STADIUM_WIDTH - PITCH_X, y: PITCH_Y + 1/4 * STADIUM_HEIGHT},
    ]
}

