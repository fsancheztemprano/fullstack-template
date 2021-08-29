package dev.kurama.api.core.service;

import static org.springframework.data.mapping.Alias.ofNullable;

import dev.kurama.api.core.domain.User;
import dev.kurama.api.core.domain.UserPreferences;
import dev.kurama.api.core.hateoas.input.UserPreferencesInput;
import dev.kurama.api.core.repository.UserPreferencesRepository;
import dev.kurama.api.core.repository.UserRepository;
import java.util.Optional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserPreferencesService {

  @NonNull
  private final UserPreferencesRepository userPreferencesRepository;

  @NonNull
  private final UserRepository userRepository;


  public Optional<UserPreferences> findUserPreferencesById(String userId) {
    return userPreferencesRepository.findUserPreferencesById(userId);
  }

  public UserPreferences createUserPreferences(User user) {
    UserPreferences userPreferences =
      UserPreferences.builder()
        .setRandomUUID()
        .user(user)
        .build();
    return userPreferencesRepository.save(userPreferences);
  }

  public UserPreferences updateUserPreferences(String userPreferencesId, UserPreferencesInput userPreferencesInput) {
    var userPreferences = userPreferencesRepository.findUserPreferencesById(userPreferencesId).orElseThrow();
    return patchUserPreferences(userPreferences, userPreferencesInput);
  }


  public Optional<UserPreferences> findUserPreferencesByUsername(String username) {
    var user = userRepository.findUserByUsername(username).orElseThrow();
    return userPreferencesRepository.findUserPreferencesByUser(user);
  }

  public UserPreferences updateUserPreferencesByUsername(String username, UserPreferencesInput userPreferencesInput) {
    var userPreferences = findUserPreferencesByUsername(username).orElseThrow();
    return patchUserPreferences(userPreferences, userPreferencesInput);
  }

  private UserPreferences patchUserPreferences(UserPreferences userPreferences,
    UserPreferencesInput userPreferencesInput) {
    if (ofNullable(userPreferencesInput.getDarkMode()).isPresent()) {
      userPreferences.setDarkMode(userPreferencesInput.getDarkMode());
    }
    if (ofNullable(userPreferencesInput.getContentLanguage()).isPresent()) {
      userPreferences.setContentLanguage(userPreferencesInput.getContentLanguage());
    }
    return userPreferencesRepository.save(userPreferences);
  }
}
