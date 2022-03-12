package dev.kurama.api.pact;

import static com.google.common.collect.Lists.newArrayList;
import static dev.kurama.api.pact.PactTemplate.pactUser;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.springframework.beans.support.PagedListHolder.DEFAULT_PAGE_SIZE;

import dev.kurama.api.core.domain.User;
import dev.kurama.api.core.domain.UserPreferences;
import dev.kurama.api.core.facade.UserFacade;
import dev.kurama.api.core.hateoas.assembler.UserModelAssembler;
import dev.kurama.api.core.hateoas.processor.UserModelProcessor;
import dev.kurama.api.core.hateoas.processor.UserPreferencesModelProcessor;
import dev.kurama.api.core.rest.UserController;
import dev.kurama.api.core.service.AuthenticationFacility;
import dev.kurama.api.core.service.UserService;
import dev.kurama.support.ImportMappers;
import java.util.Optional;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@WebMvcTest(controllers = UserController.class)
@Import({UserFacade.class, UserModelProcessor.class, UserModelAssembler.class, UserPreferencesModelProcessor.class})
@ImportMappers
public class UserControllerBase extends PactBase {

  @MockBean
  private UserService userService;

  @MockBean
  private AuthenticationFacility authenticationFacility;

  @Override
  protected void beforeEach() throws Exception {
    User pactUser = pactUser();
    PageRequest pageRequest = PageRequest.ofSize(DEFAULT_PAGE_SIZE);
    PageImpl<User> page = new PageImpl<>(newArrayList(pactUser, User.builder()
      .setRandomUUID()
      .username("pactUser2")
      .email("pactUser2@localhost")
      .userPreferences(UserPreferences.builder().setRandomUUID().build())
      .build(), User.builder()
      .setRandomUUID()
      .username("pactUser3")
      .email("pactUser3@localhost")
      .userPreferences(UserPreferences.builder().setRandomUUID().build())
      .build()), pageRequest, 3);

    doReturn(Optional.of(pactUser)).when(userService).findUserById(pactUser.getId());
    doReturn(Optional.empty()).when(userService).findUserById("notFoundId");
    doReturn(page).when(userService).getAllUsers(any(), any());
  }
}