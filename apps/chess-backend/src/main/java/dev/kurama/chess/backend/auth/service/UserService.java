package dev.kurama.chess.backend.auth.service;

import static dev.kurama.chess.backend.auth.constant.UserConstant.EMAIL_ALREADY_EXISTS;
import static dev.kurama.chess.backend.auth.constant.UserConstant.NO_USER_FOUND_BY_USERNAME;
import static dev.kurama.chess.backend.auth.constant.UserConstant.USERNAME_ALREADY_EXISTS;
import static dev.kurama.chess.backend.auth.domain.Role.USER_ROLE;
import static org.apache.commons.lang3.ObjectUtils.isNotEmpty;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

import dev.kurama.chess.backend.auth.domain.Role;
import dev.kurama.chess.backend.auth.domain.User;
import dev.kurama.chess.backend.auth.domain.UserPrincipal;
import dev.kurama.chess.backend.auth.exception.domain.EmailExistsException;
import dev.kurama.chess.backend.auth.exception.domain.UserNotFoundException;
import dev.kurama.chess.backend.auth.exception.domain.UsernameExistsException;
import dev.kurama.chess.backend.auth.repository.UserRepository;
import java.util.Date;
import java.util.List;
import javax.transaction.Transactional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.flogger.Flogger;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Flogger
@RequiredArgsConstructor
@Service
@Transactional
@Qualifier("userDetailsService")
public class UserService implements UserDetailsService {

  @NonNull
  private final UserRepository userRepository;
  @NonNull
  private final BCryptPasswordEncoder passwordEncoder;
  @NonNull
  private final LoginAttemptService loginAttemptService;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    var user = userRepository.findUserByUsername(username).orElseThrow();
    if (user == null) {
      throw new UsernameNotFoundException("User not found by username: " + username);
    } else {
      validateLoginAttempt(user);
      user.setLastLoginDateDisplay(user.getLastLoginDate());
      user.setLastLoginDate(new Date());
      userRepository.save(user);
      return new UserPrincipal(user);
    }
  }

  public User findUserByUsername(String username) {
    return userRepository.findUserByUsername(username).orElseThrow();
  }

  public User findUserByEmail(String email) {
    return userRepository.findUserByEmail(email).orElseThrow();
  }

  public List<User> getAllUsers() {
    return userRepository.findAll();
  }

  public void deleteUser(String username) {
    var user = userRepository.findUserByUsername(username).orElseThrow();
    userRepository.deleteById(user.getTid());
  }

  public User register(String username, String password, String email, String firstName, String lastName)
    throws UsernameExistsException, EmailExistsException {
    validateUsernameAndEmailCreate(username, email);
    User user = User.builder()
      .setRandomUUID()
      .username(username)
      .password(passwordEncoder.encode(password))
      .email(email)
      .firstName(firstName)
      .lastName(lastName)
      .joinDate(new Date())
      .active(true)
      .locked(false)
      .expired(false)
      .credentialsExpired(false)
      .role(USER_ROLE.name())
      .authorities(USER_ROLE.getAuthorities()).build();
    userRepository.save(user);
    log.atInfo().log(String.format("New user registered: %s:%s", username, password));
    return user;
  }

  public User createUser(User newUser)
    throws UsernameExistsException, EmailExistsException {
    validateUsernameAndEmailCreate(newUser.getUsername(), newUser.getEmail());
    User user = User.builder()
      .setRandomUUID()
      .username(newUser.getUsername())
      .password(passwordEncoder.encode(newUser.getPassword()))
      .email(newUser.getEmail())
      .firstName(newUser.getFirstName())
      .lastName(newUser.getLastName())
      .joinDate(new Date())
      .active(newUser.isActive())
      .locked(newUser.isLocked())
      .expired(newUser.isExpired())
      .credentialsExpired(newUser.isCredentialsExpired())
      .role(getRoleEnumName(newUser.getRole()).name())
      .authorities(getRoleEnumName(newUser.getRole()).getAuthorities()).build();
    userRepository.save(user);
    log.atInfo().log(String.format("New user registered: %s:%s", user.getUsername(), user.getPassword()));
    return user;
  }

  public User updateUser(String username, User modifiedUser)
    throws UserNotFoundException, UsernameExistsException, EmailExistsException {
    var currentUser = validateUsernameAndEmailUpdate(username, modifiedUser.getUsername(), modifiedUser.getEmail());
    currentUser.setEmail(modifiedUser.getEmail());
    currentUser.setFirstName(modifiedUser.getFirstName());
    currentUser.setLastName(modifiedUser.getLastName());
    currentUser.setActive(modifiedUser.isActive());
    currentUser.setLocked(modifiedUser.isLocked());
    currentUser.setExpired(modifiedUser.isExpired());
    currentUser.setCredentialsExpired(modifiedUser.isCredentialsExpired());
    currentUser.setRole(getRoleEnumName(modifiedUser.getRole()).name());
    currentUser.setAuthorities(getRoleEnumName(modifiedUser.getRole()).getAuthorities());
    userRepository.save(currentUser);
    return currentUser;
  }

  private Role getRoleEnumName(String role) {
    return Role.valueOf(role.toUpperCase());
  }

  private void validateUsernameAndEmailCreate(String newUsername, String email)
    throws UsernameExistsException, EmailExistsException {
    var userByNewUsername = findUserByUsername(newUsername);
    var userByNewEmail = findUserByEmail(email);
    if (userByNewUsername != null) {
      throw new UsernameExistsException(USERNAME_ALREADY_EXISTS + newUsername);
    }
    if (userByNewEmail != null) {
      throw new EmailExistsException(EMAIL_ALREADY_EXISTS + email);
    }
  }

  private User validateUsernameAndEmailUpdate(String currentUsername, String newUsername, String email)
    throws UsernameExistsException, EmailExistsException, UserNotFoundException {
    var userByNewUsername = findUserByUsername(newUsername);
    var userByNewEmail = findUserByEmail(email);
    if (isNotEmpty(currentUsername) && isNotBlank(currentUsername)) {
      var currentUser = findUserByUsername(currentUsername);
      if (currentUser == null) {
        throw new UserNotFoundException(NO_USER_FOUND_BY_USERNAME + currentUsername);
      }
      if (userByNewUsername != null && !currentUser.getId().equals(userByNewUsername.getId())) {
        throw new UsernameExistsException(USERNAME_ALREADY_EXISTS + currentUsername);
      }
      if (userByNewEmail != null && !currentUser.getId().equals(userByNewEmail.getId())) {
        throw new EmailExistsException(EMAIL_ALREADY_EXISTS + email);
      }
      return currentUser;
    } else {
      throw new UserNotFoundException(NO_USER_FOUND_BY_USERNAME + currentUsername);
    }
  }

  private void validateLoginAttempt(User user) {
    if (user.isLocked()) {
      loginAttemptService.evictUserFromLoginAttemptCache(user.getUsername());
    } else {
      user.setLocked(loginAttemptService.hasExceededMaxAttempts(user.getUsername()));
    }
  }
}
