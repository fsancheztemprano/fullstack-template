import { HttpHeaderKey, TicTacToeAuthority, TicTacToeGamePlayer, TicTacToeGameStatus } from '@app/ui/shared/domain';
import { defaultTemplate } from '@app/ui/testing';
import { ContentType, ITemplate } from '@hal-form-client';
import { InteractionObject } from '@pact-foundation/pact';
import { HTTPMethod } from '@pact-foundation/pact/src/common/request';
import { boolean, string } from '@pact-foundation/pact/src/dsl/matchers';
import { bearer } from '../../../utils/pact.utils';
import { jwtToken } from '../../../utils/token.utils';

export const createGameTemplate: { create: ITemplate } = {
  create: {
    method: 'POST',
    target: '/api/tic-tac-toe/game',
    properties: [
      { name: 'oId', type: 'text', required: true },
      { name: 'xId', type: 'text', required: true },
      { name: 'isPrivate', type: 'boolean' },
    ],
  },
};

function gameWitId(gameId: string) {
  return {
    _links: {
      self: { href: `http://localhost/api/tic-tac-toe/game/${gameId}` },
      // ws: { href: `ws://localhost/api/tic-tac-toe/game/${gameId}` },
    },
    id: `${gameId}`,
  };
}

const pendingGame = {
  ...gameWitId('tic-tac-toe-g1'),
  status: 'PENDING',
  isPrivate: true,
  requestedAt: 1000000,
  playerX: {
    id: 'user-a-id',
    username: string(),
    wins: 0,
    losses: 0,
    draws: 0,
  },
  playerO: {
    id: 'user-b-id',
    username: string(),
    wins: 0,
    losses: 0,
    draws: 0,
  },
  _templates: { ...defaultTemplate },
};

const inProgressGame = {
  ...pendingGame,
  ...gameWitId('tic-tac-toe-g2'),
  status: 'IN_PROGRESS',
  isPrivate: false,
  startedAt: 2000000,
  turn: TicTacToeGamePlayer.O,
  board: 'XXOOO_X__',
};

const rejectedGame = {
  ...pendingGame,
  ...gameWitId('tic-tac-toe-g3'),
  status: 'REJECTED',
  isPrivate: true,
  playerX: {
    id: 'user-c-id',
    username: string(),
    wins: 0,
    losses: 0,
    draws: 0,
  },
  lastActivityAt: 3000000,
};

const finishedGame = {
  ...inProgressGame,
  ...gameWitId('tic-tac-toe-g4'),
  status: 'FINISHED',
  finishedAt: 4000000,
  turn: undefined,
  board: 'XXOOOOX_X',
  playerX: {
    id: 'user-c-id',
    username: string(),
    wins: 0,
    losses: 0,
    draws: 0,
  },
  result: TicTacToeGamePlayer.O,
};

export const moveTemplate: { move: ITemplate } = {
  move: {
    method: 'POST',
    target: '/api/tic-tac-toe/game/tic-tac-toe-g2/move',
    properties: [
      {
        name: 'cell',
        type: 'string',
        required: true,
        options: {
          inline: ['B1', 'C1', 'B2'],
        },
      },
    ],
  },
};

export const statusTemplate: { status: ITemplate } = {
  status: {
    method: 'PATCH',
    target: '/api/tic-tac-toe/game/tic-tac-toe-g1',
    properties: [
      {
        name: 'status',
        type: 'text',
        regex: '^(REJECTED|IN_PROGRESS)$',
      },
    ],
  },
};

export namespace GetAllTicTacToeGamesPact {
  export const all_for_admin: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get all tic tac toe games',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken({ authorities: [TicTacToeAuthority.TIC_TAC_TOE_GAME_READ] })),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        _links: {
          self: { href: 'http://localhost/api/tic-tac-toe/game?page=0' },
          first: { href: 'http://localhost/api/tic-tac-toe/game?page=0' },
          last: { href: 'http://localhost/api/tic-tac-toe/game?page=1' },
          next: { href: 'http://localhost/api/tic-tac-toe/game?page=1' },
          prev: { href: 'http://localhost/api/tic-tac-toe/game?page=0' },
        },
        page: { size: 20, totalElements: 30, totalPages: 2, number: 0 },
        _embedded: {
          ticTacToeGameModelList: [pendingGame, inProgressGame, rejectedGame, finishedGame],
        },
        _templates: {
          ...defaultTemplate,
        },
      },
    },
  };

  export const affected_or_public_for_player: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get my tic tac toe games and public games',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-a-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        _links: {
          self: { href: 'http://localhost/api/tic-tac-toe/my-games?page=0' },
          first: { href: 'http://localhost/api/tic-tac-toe/my-games?page=0' },
          last: { href: 'http://localhost/api/tic-tac-toe/my-games?page=1' },
          next: { href: 'http://localhost/api/tic-tac-toe/my-games?page=1' },
          prev: { href: 'http://localhost/api/tic-tac-toe/my-games?page=0' },
        },
        page: { size: 20, totalElements: 30, totalPages: 2, number: 0 },
        _embedded: {
          ticTacToeGameModelList: [pendingGame, inProgressGame, finishedGame],
        },
        _templates: { ...defaultTemplate },
      },
    },
  };

  export const error_unauthorized: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get all tic tac toe games unauthorized',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken()),
      },
    },
    willRespondWith: {
      status: 403,
      body: {
        reason: 'Forbidden',
        title: 'Sorry, you do not have permission to access this resource.',
      },
    },
  };
}

export namespace CreateTicTacToeGamePact {
  export const successful_as_player: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'create a tic tac toe game as player',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-a-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
      body: {
        xId: 'user-a-id',
        oId: 'user-b-id',
        private: boolean(),
      },
    },
    willRespondWith: {
      status: 204,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...pendingGame,
      },
    },
  };

  export const successful_as_admin: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'create a tic tac toe game as admin',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'admin-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_GAME_CREATE],
          }),
        ),
      },
      body: {
        xId: 'user-a-id',
        oId: 'user-b-id',
        private: boolean(),
      },
    },
    willRespondWith: {
      status: 204,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...pendingGame,
      },
    },
  };

  export const error_unauthorized: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'create a tic tac toe game unauthorized',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(jwtToken()),
      },
      body: {
        xId: 'user-a-id',
        oId: 'user-b-id',
        private: boolean(),
      },
    },
    willRespondWith: {
      status: 403,
      body: {
        reason: 'Forbidden',
        title: 'Sorry, you do not have permission to access this resource.',
      },
    },
  };

  export const error_no_opponent: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'create a tic tac toe game when rival is same as initiator',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'admin-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_GAME_CREATE],
          }),
        ),
      },
      body: {
        xId: 'user-a-id',
        oId: 'user-a-id',
        private: boolean(),
      },
    },
    willRespondWith: {
      status: 400,
      body: {
        reason: 'Bad Request',
        title: 'An error has occurred',
        message: 'X and O cannot be the same player',
      },
    },
  };

  export const error_not_found: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'create a tic tac toe game when player is not found',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'admin-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_GAME_CREATE],
          }),
        ),
      },
      body: {
        xId: 'user-z-id',
        oId: 'user-z-id',
        private: boolean(),
      },
    },
    willRespondWith: {
      status: 404,
      body: {
        reason: 'Not Found',
        title: 'TicTacToePlayer with id: user-z-id not found',
        message: 'user-z-id',
      },
    },
  };
}

export namespace GetOneTicTacToeGamePact {
  export const private_as_admin: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one private tic tac toe game with tic-tac-toe:game:read as admin',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g1',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken({ authorities: [TicTacToeAuthority.TIC_TAC_TOE_GAME_READ] })),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...pendingGame,
        _templates: {
          ...defaultTemplate,
          ...statusTemplate,
        },
      },
    },
  };

  export const private_as_player: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one private tic tac toe game with as player',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g1',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-a-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...pendingGame,
        _templates: {
          ...defaultTemplate,
          ...statusTemplate,
        },
      },
    },
  };

  export const private_as_viewer: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one private tic tac toe game as viewer',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g1',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-c-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
    },
    willRespondWith: {
      status: 403,
      body: {
        reason: 'Forbidden',
        title: 'Sorry, you do not have permission to access this resource.',
      },
    },
  };

  export const public_as_viewer: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one public tic tac toe game as viewer',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-c-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: { ...inProgressGame },
    },
  };

  export const in_progress_inactive_player: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one tic tac toe game in progress inactive player',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-b-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...inProgressGame,
      },
    },
  };

  export const in_progress_active_player: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one tic tac toe game in progress active player',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-a-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...inProgressGame,
        _templates: {
          ...defaultTemplate,
          ...moveTemplate,
        },
      },
    },
  };

  export const rejected: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one tic tac toe game rejected',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g3',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-c-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...rejectedGame,
      },
    },
  };

  export const finished: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one tic tac toe game finished',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g4',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-a-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...finishedGame,
      },
    },
  };

  export const error_not_found: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one tic tac toe game not found',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g0',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken({ authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT] })),
      },
    },
    willRespondWith: {
      status: 404,
      body: {
        reason: 'Not Found',
        title: 'Game not found',
      },
    },
  };

  export const error_unauthorized: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get one tic tac toe game unauthorized',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g1',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken()),
      },
    },
    willRespondWith: {
      status: 403,
      body: {
        reason: 'Forbidden',
        title: 'Sorry, you do not have permission to access this resource.',
      },
    },
  };
}

export namespace PatchOneTicTacToeGamePact {
  export const as_admin: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'successfully reject one tic tac toe game as admin',
    withRequest: {
      method: HTTPMethod.PATCH,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g1',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(jwtToken({ authorities: [TicTacToeAuthority.TIC_TAC_TOE_GAME_CREATE] })),
      },
      body: {
        status: TicTacToeGameStatus.REJECTED,
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: { ...rejectedGame },
    },
  };

  export const as_opponent_player: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'accept one tic tac toe game as opponent player',
    withRequest: {
      method: HTTPMethod.PATCH,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g1',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({ user: { id: 'user-b-id' }, authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT] }),
        ),
      },
      body: {
        status: TicTacToeGameStatus.IN_PROGRESS,
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: { ...inProgressGame },
    },
  };

  export const error_as_viewer: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'accept one tic tac toe game as viewer',
    withRequest: {
      method: HTTPMethod.PATCH,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g1',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({ user: { id: 'user-c-id' }, authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT] }),
        ),
      },
      body: {
        status: TicTacToeGameStatus.IN_PROGRESS,
      },
    },
    willRespondWith: {
      status: 403,
      body: {
        reason: 'Forbidden',
        title: 'Insufficient permissions',
      },
    },
  };

  export const error_unauthorized: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'accept one tic tac toe game unauthorized',
    withRequest: {
      method: HTTPMethod.PATCH,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g1',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(jwtToken()),
      },
      body: {
        status: TicTacToeGameStatus.IN_PROGRESS,
      },
    },
    willRespondWith: {
      status: 403,
      body: {
        reason: 'Forbidden',
        title: 'Insufficient permissions',
      },
    },
  };

  export const error_not_found: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'accept one tic tac toe game not found',
    withRequest: {
      method: HTTPMethod.PATCH,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g0',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(jwtToken({ authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT] })),
      },
      body: {
        status: TicTacToeGameStatus.IN_PROGRESS,
      },
    },
    willRespondWith: {
      status: 404,
      body: {
        reason: 'Not Found',
        title: 'Game not found',
      },
    },
  };
}

export namespace MoveTicTacToeGamePact {
  export const successful_as_admin: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'make a move a tic tac toe game as admin',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2/move',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(jwtToken({ authorities: [TicTacToeAuthority.TIC_TAC_TOE_GAME_MOVE] })),
      },
      body: {
        cell: 'A2',
      },
    },
    willRespondWith: {
      status: 202,
    },
  };

  export const successful_as_player: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'make a move a tic tac toe game as active player',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2/move',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-a-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
      body: {
        cell: 'A2',
      },
    },
    willRespondWith: {
      status: 202,
    },
  };

  export const error_as_inactive_player: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'make a move a tic tac toe game as inactive player',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2/move',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-b-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
      body: {
        cell: 'A2',
      },
    },
    willRespondWith: {
      status: 400,
      body: {
        title: 'Bad Request',
        reason: 'Not your turn',
      },
    },
  };

  export const error_as_viewer: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'make a move a tic tac toe game as viewer',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2/move',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-c-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
      body: {
        cell: 'A2',
      },
    },
    willRespondWith: {
      status: 403,
      body: {
        reason: 'Forbidden',
        title: 'Insufficient permissions',
      },
    },
  };

  export const error_cell_is_occupied: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'make a move a tic tac toe game cell is occupied',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2/move',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-a-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
      body: {
        cell: 'A1',
      },
    },
    willRespondWith: {
      status: 400,
      body: {
        title: 'Bad Request',
        reason: 'Cell is occupied',
      },
    },
  };

  export const error_game_finished: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'make a move a tic tac toe game finished',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g4/move',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-c-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
      body: {
        cell: 'A1',
      },
    },
    willRespondWith: {
      status: 400,
      body: {
        title: 'Bad Request',
        reason: 'Game is Over',
      },
    },
  };

  export const error_not_found: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'make a move a tic tac toe game not found',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g0/move',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(
          jwtToken({
            user: { id: 'user-a-id' },
            authorities: [TicTacToeAuthority.TIC_TAC_TOE_ROOT],
          }),
        ),
      },
      body: {
        cell: 'A1',
      },
    },
    willRespondWith: {
      status: 404,
      body: {
        title: 'Not Found',
      },
    },
  };

  export const error_unauthorized: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'make a move a tic tac toe unauthorized',
    withRequest: {
      method: HTTPMethod.POST,
      path: '/api/tic-tac-toe/game/tic-tac-toe-g2/move',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        'Content-Type': ContentType.APPLICATION_JSON,
        Authorization: bearer(jwtToken()),
      },
      body: {
        cell: 'A1',
      },
    },
    willRespondWith: {
      status: 401,
      body: {
        title: 'Unauthorized',
      },
    },
  };
}