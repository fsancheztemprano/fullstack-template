package dev.kurama.chess.backend.auth.api.domain.input;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.NonNull;
import org.hibernate.validator.constraints.Length;

@Data
@Builder
public class SignupInput {

  @NonNull
  @NotNull
  @Length(min = 5, max = 128)
  private String username;

  @NonNull
  @NotNull
  @Length(min = 8, max = 128)
  private String password;

  @NonNull
  @Email
  private String email;

  private String firstname;

  private String lastname;

}
