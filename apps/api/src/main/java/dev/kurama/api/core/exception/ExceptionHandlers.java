package dev.kurama.api.core.exception;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.METHOD_NOT_ALLOWED;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import com.auth0.jwt.exceptions.TokenExpiredException;
import dev.kurama.api.core.domain.DomainResponse;
import dev.kurama.api.core.exception.domain.EmailExistsException;
import dev.kurama.api.core.exception.domain.EmailNotFoundException;
import dev.kurama.api.core.exception.domain.RoleNotFoundException;
import dev.kurama.api.core.exception.domain.UserLockedException;
import dev.kurama.api.core.exception.domain.UserNotFoundException;
import dev.kurama.api.core.exception.domain.UsernameExistsException;
import java.io.IOException;
import java.util.Objects;
import javax.persistence.NoResultException;
import lombok.extern.flogger.Flogger;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Flogger
@RestController
@RestControllerAdvice
public class ExceptionHandlers implements ErrorController {

  public static final String ERROR_PATH = "/error";

  private static final String ACCOUNT_LOCKED = "Your account has been locked. Please contact administration";
  private static final String METHOD_IS_NOT_ALLOWED = "This request method is not allowed on this endpoint. Please send a '%s' request";
  private static final String INTERNAL_SERVER_ERROR_MSG = "An error occurred while processing the request";
  private static final String INCORRECT_CREDENTIALS = "Username / password incorrect. Please try again";
  private static final String ACCOUNT_DISABLED = "Your account has been disabled. If this is an error, please contact administration";
  private static final String ERROR_PROCESSING_FILE = "Error occurred while processing file";
  private static final String NOT_ENOUGH_PERMISSION = "You do not have enough permission";

  @ExceptionHandler(DisabledException.class)
  public ResponseEntity<DomainResponse> accountDisabledException(DisabledException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(BAD_REQUEST, ACCOUNT_DISABLED);
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<DomainResponse> badCredentialsException(BadCredentialsException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(BAD_REQUEST, INCORRECT_CREDENTIALS);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<DomainResponse> accessDeniedException(AccessDeniedException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(FORBIDDEN, NOT_ENOUGH_PERMISSION);
  }

  @ExceptionHandler(LockedException.class)
  public ResponseEntity<DomainResponse> lockedException(LockedException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(UNAUTHORIZED, ACCOUNT_LOCKED);
  }

  @ExceptionHandler(TokenExpiredException.class)
  public ResponseEntity<DomainResponse> tokenExpiredException(TokenExpiredException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(UNAUTHORIZED, exception.getMessage());
  }

  @ExceptionHandler(EmailExistsException.class)
  public ResponseEntity<DomainResponse> emailExistsException(EmailExistsException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(BAD_REQUEST, exception.getMessage());
  }

  @ExceptionHandler(UsernameExistsException.class)
  public ResponseEntity<DomainResponse> usernameExistsException(UsernameExistsException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(BAD_REQUEST, exception.getMessage());
  }

  @ExceptionHandler(EmailNotFoundException.class)
  public ResponseEntity<DomainResponse> emailNotFoundException(EmailNotFoundException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(BAD_REQUEST, exception.getMessage());
  }

  @ExceptionHandler({UserNotFoundException.class, UsernameNotFoundException.class})
  public ResponseEntity<DomainResponse> userNotFoundException(UserNotFoundException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(BAD_REQUEST, exception.getMessage());
  }

//  @ExceptionHandler(NoHandlerFoundException.class)
//  public ResponseEntity<DomainResponse> noHandlerFoundException(NoHandlerFoundException exception) {
//    log.atWarning().log(exception.getMessage());
//    return createDomainResponse(BAD_REQUEST, "There is no mapping for this URL");
//  }

  @ExceptionHandler(UserLockedException.class)
  public ResponseEntity<DomainResponse> userLockedException(UserLockedException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(BAD_REQUEST, String.format("User %s is locked", exception.getMessage()));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<DomainResponse> methodNotSupportedException(HttpRequestMethodNotSupportedException exception) {
    HttpMethod supportedMethod = Objects.requireNonNull(exception.getSupportedHttpMethods()).iterator().next();
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(METHOD_NOT_ALLOWED, String.format(METHOD_IS_NOT_ALLOWED, supportedMethod));
  }

  @ExceptionHandler({NoResultException.class, RoleNotFoundException.class})
  public ResponseEntity<DomainResponse> notFoundException(NoResultException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(NOT_FOUND, exception.getMessage());
  }

  @ExceptionHandler(IOException.class)
  public ResponseEntity<DomainResponse> iOException(IOException exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(INTERNAL_SERVER_ERROR, ERROR_PROCESSING_FILE);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<DomainResponse> internalServerErrorException(Exception exception) {
    log.atWarning().log(exception.getMessage());
    return createDomainResponse(INTERNAL_SERVER_ERROR, exception.getMessage());
  }

  private ResponseEntity<DomainResponse> createDomainResponse(HttpStatus status, String message) {
    return new ResponseEntity<>(DomainResponse.builder()
      .status(status)
      .code(status.value())
      .message(message)
      .build(),
      status);
  }

  @RequestMapping(ERROR_PATH)
  public ResponseEntity<DomainResponse> notFound404() {
    return createDomainResponse(NOT_FOUND, "There is no mapping for this URL");
  }

  public String getErrorPath() {
    return ERROR_PATH;
  }
}
