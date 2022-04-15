import { HttpHeaderKey } from '@app/ui/shared/domain';
import { defaultTemplate, updateUserPreferencesTemplate } from '@app/ui/testing';
import { ContentType } from '@hal-form-client';
import { InteractionObject } from '@pact-foundation/pact';
import { HTTPMethod } from '@pact-foundation/pact/src/common/request';
import { pactUserPreferences } from '../../mocks/user.mock';
import { bearer } from '../../utils/pact.utils';
import { jwtToken } from '../../utils/token.util';

export namespace GetUserPreferencesPact {
  export const successful: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get user preferences',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/user/preferences/pactUserPreferencesId',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken({ authorities: ['user:preferences:read'] })),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: { ...pactUserPreferences },
    },
  };

  export const with_update: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get user preferences with update',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/user/preferences/pactUserPreferencesId',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken({ authorities: ['user:preferences:read', 'user:preferences:update'] })),
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: {
        ...pactUserPreferences,
        _templates: {
          ...defaultTemplate,
          ...updateUserPreferencesTemplate,
        },
      },
    },
  };

  export const not_found: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get user preferences not found',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/user/preferences/notFoundId',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken({ authorities: ['user:preferences:read'] })),
      },
    },
    willRespondWith: {
      status: 404,
      body: {
        reason: 'Not Found',
        title: 'UserPreferences with id: notFoundId not found',
      },
    },
  };

  export const unauthorized: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'get user preferences unauthorized',
    withRequest: {
      method: HTTPMethod.GET,
      path: '/api/user/preferences/pactUserPreferencesId',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken()),
      },
    },
    willRespondWith: {
      status: 401,
      body: {
        reason: 'Unauthorized',
        title: 'Insufficient permissions',
      },
    },
  };
}

export namespace UpdateUserPreferencesPact {
  export const successful: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'update user preferences',
    withRequest: {
      method: HTTPMethod.PATCH,
      path: '/api/user/preferences/pactUserPreferencesId',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken({ authorities: ['user:preferences:read', 'user:preferences:update'] })),
        [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON,
      },
      body: {
        darkMode: true,
      },
    },
    willRespondWith: {
      status: 200,
      headers: { [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON_HAL_FORMS },
      body: { ...pactUserPreferences },
    },
  };

  export const not_found: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'update user preferences not found',
    withRequest: {
      method: HTTPMethod.PATCH,
      path: '/api/user/preferences/notFoundId',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken({ authorities: ['user:preferences:update'] })),
        [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON,
      },
      body: {
        darkMode: true,
      },
    },
    willRespondWith: {
      status: 404,
      body: {
        reason: 'Not Found',
        title: 'UserPreferences with id: notFoundId not found',
      },
    },
  };

  export const unauthorized: InteractionObject = {
    state: 'stateless',
    uponReceiving: 'update user preferences unauthorized',
    withRequest: {
      method: HTTPMethod.PATCH,
      path: '/api/user/preferences/pactUserPreferencesId',
      headers: {
        Accept: ContentType.APPLICATION_JSON_HAL_FORMS,
        Authorization: bearer(jwtToken()),
        [HttpHeaderKey.CONTENT_TYPE]: ContentType.APPLICATION_JSON,
      },
      body: {
        darkMode: true,
      },
    },
    willRespondWith: {
      status: 401,
      body: {
        reason: 'Unauthorized',
        title: 'Insufficient permissions',
      },
    },
  };
}
