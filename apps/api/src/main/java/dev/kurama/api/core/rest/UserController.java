package dev.kurama.api.core.rest;

import static dev.kurama.api.core.constant.RestPathConstant.USER_PATH;
import static org.springframework.beans.support.PagedListHolder.DEFAULT_PAGE_SIZE;
import static org.springframework.http.ResponseEntity.created;
import static org.springframework.http.ResponseEntity.noContent;
import static org.springframework.http.ResponseEntity.ok;
import static org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentRequestUri;

import dev.kurama.api.core.exception.domain.ActivationTokenRecentException;
import dev.kurama.api.core.exception.domain.exists.EmailExistsException;
import dev.kurama.api.core.exception.domain.exists.UsernameExistsException;
import dev.kurama.api.core.exception.domain.not.found.RoleNotFoundException;
import dev.kurama.api.core.exception.domain.not.found.UserNotFoundException;
import dev.kurama.api.core.facade.UserFacade;
import dev.kurama.api.core.hateoas.input.UserAuthoritiesInput;
import dev.kurama.api.core.hateoas.input.UserInput;
import dev.kurama.api.core.hateoas.input.UserRoleInput;
import dev.kurama.api.core.hateoas.model.UserModel;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(USER_PATH)
@PreAuthorize("isAuthenticated()")
public class UserController {

  @NonNull
  private final UserFacade userFacade;

  @GetMapping("/{userId}")
  @PreAuthorize("hasAuthority('user:read')")
  public ResponseEntity<UserModel> get(@PathVariable("userId") String userId) throws UserNotFoundException {
    return ok().body(userFacade.findByUserId(userId));
  }

  @GetMapping()
  @PreAuthorize("hasAuthority('user:read')")
  public ResponseEntity<PagedModel<UserModel>> getAll(
    @PageableDefault(page = 0, size = DEFAULT_PAGE_SIZE) Pageable pageable,
    @RequestParam(value = "search", required = false) String search) {
    return ok().body(userFacade.getAll(pageable, search));
  }

  @PostMapping()
  @PreAuthorize("hasAuthority('user:create')")
  public ResponseEntity<UserModel> create(@RequestBody UserInput userInput)
    throws UsernameExistsException, EmailExistsException {
    UserModel newUser = userFacade.create(userInput);
    return created(fromCurrentRequestUri().path("/user/{userId}")
                                          .buildAndExpand(newUser.getId())
                                          .toUri()).body(newUser);
  }

  @PatchMapping("/{userId}")
  @PreAuthorize("hasAuthority('user:update')")
  public ResponseEntity<UserModel> update(@PathVariable("userId") String userId, @RequestBody UserInput userInput)
    throws UserNotFoundException, UsernameExistsException, EmailExistsException, RoleNotFoundException {
    userInput.setAuthorityIds(null);
    userInput.setRoleId(null);
    return ok().body(userFacade.update(userId, userInput));
  }

  @PatchMapping("/{userId}/role")
  @PreAuthorize("hasAuthority('user:update:role')")
  public ResponseEntity<UserModel> updateRole(@PathVariable("userId") String userId,
                                              @RequestBody UserRoleInput userRoleInput)
    throws UserNotFoundException, UsernameExistsException, EmailExistsException, RoleNotFoundException {
    return ok().body(userFacade.update(userId, UserInput.builder()
                                                        .roleId(userRoleInput.getRoleId())
                                                        .build()));
  }

  @PatchMapping("/{userId}/authorities")
  @PreAuthorize("hasAuthority('user:update:authorities')")
  public ResponseEntity<UserModel> updateAuthorities(@PathVariable("userId") String userId,
                                                     @RequestBody UserAuthoritiesInput userAuthoritiesInput)
    throws UserNotFoundException, UsernameExistsException, EmailExistsException, RoleNotFoundException {
    return ok().body(userFacade.update(userId, UserInput.builder()
                                                        .authorityIds(userAuthoritiesInput.getAuthorityIds())
                                                        .build()));
  }

  @DeleteMapping("/{userId}")
  @PreAuthorize("hasAuthority('user:delete')")
  public ResponseEntity<Void> delete(@PathVariable("userId") String userId) throws UserNotFoundException {
    userFacade.deleteById(userId);
    return noContent().build();
  }

  @PostMapping("/{userId}")
  @PreAuthorize("hasAuthority('user:update')")
  public ResponseEntity<Void> requestActivationToken(@PathVariable("userId") String userId)
    throws UserNotFoundException, ActivationTokenRecentException {
    userFacade.requestActivationToken(userId);
    return noContent().build();
  }
}
