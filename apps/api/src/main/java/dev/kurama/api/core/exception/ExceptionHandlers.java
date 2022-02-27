package dev.kurama.api.core.exception;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.METHOD_NOT_ALLOWED;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import com.auth0.jwt.exceptions.TokenExpiredException;
import dev.kurama.api.core.domain.DomainResponse;
import dev.kurama.api.core.exception.domain.ImmutableRoleException;
import dev.kurama.api.core.exception.domain.RoleCanNotLoginException;
import dev.kurama.api.core.exception.domain.SignupClosedException;
import dev.kurama.api.core.exception.domain.exists.EntityExistsException;
import dev.kurama.api.core.exception.domain.not.found.DomainEntityNotFoundException;
import java.io.IOException;
import java.util.NoSuchElementException;
import java.util.Objects;
import javax.persistence.NoResultException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

@ControllerAdvice
public class ExceptionHandlers {

  public static final String ERROR_PATH = "/error";

  private static final String ROLE_LOCKED = "Your role has been locked. Please contact administration";
  private static final String ACCOUNT_LOCKED = "Your account has been locked. Please recover your password or contact"
    + " administration";
  private static final String TOKEN_EXPIRED = "This token is expired. Log in again to get a valid one.";
  private static final String METHOD_IS_NOT_ALLOWED = "This request method is not allowed on this endpoint. Please "
    + "send a '%s' request";
  private static final String INCORRECT_CREDENTIALS = "Username / password incorrect. Please try again";
  private static final String ACCOUNT_DISABLED = "Your account has been disabled. If this is an error, please contact"
    + " administration";
  private static final String ERROR_PROCESSING_FILE = "Error occurred while processing file";
  private static final String NOT_FOUND_MESSAGE = "Identifier %s was not found";
  private static final String EXISTS_MESSAGE = "Identifier %s is already used";
  private static final String IMMUTABLE_ROLE = "Role %s is not modifiable";
  private static final String SIGN_UP_CLOSED = "Sign Up is closed, try again later.";

  @ExceptionHandler(DisabledException.class)
  public ResponseEntity<DomainResponse> accountDisabledException(DisabledException exception) {
    return createDomainResponse(BAD_REQUEST, ACCOUNT_DISABLED, exception.getMessage());
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<DomainResponse> badCredentialsException(BadCredentialsException exception) {
    return createDomainResponse(BAD_REQUEST, INCORRECT_CREDENTIALS, exception.getMessage());
  }

  @ExceptionHandler(LockedException.class)
  public ResponseEntity<DomainResponse> lockedException(LockedException exception) {
    return createDomainResponse(UNAUTHORIZED, ACCOUNT_LOCKED, exception.getMessage());
  }

  @ExceptionHandler(RoleCanNotLoginException.class)
  public ResponseEntity<DomainResponse> roleCanNotLoginException(RoleCanNotLoginException exception) {
    return createDomainResponse(UNAUTHORIZED, ROLE_LOCKED, exception.getMessage());
  }

  @ExceptionHandler(TokenExpiredException.class)
  public ResponseEntity<DomainResponse> tokenExpiredException(TokenExpiredException exception) {
    return createDomainResponse(UNAUTHORIZED, TOKEN_EXPIRED, exception.getMessage());
  }

  @ExceptionHandler(ImmutableRoleException.class)
  public ResponseEntity<DomainResponse> immutableRoleException(ImmutableRoleException exception) {
    return createDomainResponse(FORBIDDEN, IMMUTABLE_ROLE, exception.getMessage());
  }

  @ExceptionHandler(SignupClosedException.class)
  public ResponseEntity<DomainResponse> signupClosedException(SignupClosedException exception) {
    return createDomainResponse(FORBIDDEN, SIGN_UP_CLOSED, exception.getMessage());
  }

  @ExceptionHandler(EntityExistsException.class)
  public ResponseEntity<DomainResponse> entityExistsException(EntityExistsException exception) {
    return createDomainResponse(CONFLICT, String.format(EXISTS_MESSAGE, exception.getMessage()),
      exception.getMessage());
  }

  @ExceptionHandler({NoSuchElementException.class, NoResultException.class, DomainEntityNotFoundException.class})
  public ResponseEntity<DomainResponse> entityNotFoundException(Exception exception) {
    return createDomainResponse(NOT_FOUND, String.format(NOT_FOUND_MESSAGE, exception.getMessage()),
      exception.getMessage());
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<DomainResponse> methodNotSupportedException(HttpRequestMethodNotSupportedException exception) {
    HttpMethod supportedMethod = Objects.requireNonNull(exception.getSupportedHttpMethods()).iterator().next();
    return createDomainResponse(METHOD_NOT_ALLOWED, String.format(METHOD_IS_NOT_ALLOWED, supportedMethod),
      exception.getMessage());
  }

  @ExceptionHandler(IOException.class)
  public ResponseEntity<DomainResponse> iOException(IOException exception) {
    return createDomainResponse(INTERNAL_SERVER_ERROR, ERROR_PROCESSING_FILE, exception.getMessage());
  }

  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<DomainResponse> noHandlerFoundException(NoHandlerFoundException exception) {
    return createDomainResponse(BAD_REQUEST, "There is no mapping for this URL", exception.getMessage());
  }

  private ResponseEntity<DomainResponse> createDomainResponse(HttpStatus status, String title, String message) {
    return new ResponseEntity<>(DomainResponse.builder()
      .reason(status.getReasonPhrase())
      .status(status.value())
      .title(title)
      .message(message)
      .build(), status);
  }
}
