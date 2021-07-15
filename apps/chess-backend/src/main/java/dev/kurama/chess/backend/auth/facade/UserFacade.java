package dev.kurama.chess.backend.auth.facade;

import dev.kurama.chess.backend.auth.api.domain.input.ChangeUserPasswordInput;
import dev.kurama.chess.backend.auth.api.domain.input.UpdateUserProfileInput;
import dev.kurama.chess.backend.auth.api.domain.input.UserInput;
import dev.kurama.chess.backend.auth.api.domain.model.UserModel;
import dev.kurama.chess.backend.auth.api.mapper.UserMapper;
import dev.kurama.chess.backend.auth.exception.domain.EmailExistsException;
import dev.kurama.chess.backend.auth.exception.domain.UserNotFoundException;
import dev.kurama.chess.backend.auth.exception.domain.UsernameExistsException;
import dev.kurama.chess.backend.auth.service.UserService;
import java.util.List;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserFacade {

  @NonNull
  private final UserService userService;

  @NonNull
  private final UserMapper userMapper;

  @NonNull
  private final AuthenticationManager authenticationManager;


  public UserModel create(UserInput userInput) throws UsernameExistsException, EmailExistsException {
    return userMapper.userToUserModel(userService.createUser(userMapper.userInputToUser(userInput)));
  }

  public UserModel findByUsername(String username) {
    return userMapper.userToUserModel(
      userService.findUserByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username)));
  }

  public List<UserModel> getAll() {
    return userMapper.userListToUserModelList(userService.getAllUsers());
  }

  public UserModel update(String username, UserInput userInput)
    throws UserNotFoundException, UsernameExistsException, EmailExistsException {
    return userMapper.userToUserModel(userService.updateUser(username, userMapper.userInputToUser(userInput)));
  }

  public UserModel updateProfile(String username, UpdateUserProfileInput updateUserProfileInput) {
    return userMapper.userToUserModel(
      userService.updateProfile(username, userMapper.updateProfileInputToUser(updateUserProfileInput)));
  }

  public void deleteByUsername(String username) {
    userService.deleteUser(username);
  }


  public UserModel changePassword(String username, ChangeUserPasswordInput changeUserPasswordInput) {
    authenticate(username, changeUserPasswordInput.getPassword());
    return userMapper.userToUserModel(
      userService.updatePassword(username, changeUserPasswordInput.getNewPassword()));
  }

  private void authenticate(String username, String password) {
    authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
  }
}
