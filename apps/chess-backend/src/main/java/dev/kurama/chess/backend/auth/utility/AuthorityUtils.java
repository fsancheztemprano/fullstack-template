package dev.kurama.chess.backend.auth.utility;

import com.google.common.collect.Lists;
import java.util.Collection;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class AuthorityUtils {

  public static Authentication getAuthentication() {
    return SecurityContextHolder.getContext().getAuthentication();
  }

  public static String getCurrentUsername() {
    return (String) getAuthentication().getPrincipal();
  }

  public static boolean isCurrentUsername(String username) {
    return getCurrentUsername().equals(username);
  }

  public static Collection<? extends GrantedAuthority> getAuthorities() {
    return getAuthentication() == null ? Lists.newArrayList() : getAuthentication().getAuthorities();
  }

  public static boolean hasAuthority(String authority) {
    return getAuthorities().contains(new SimpleGrantedAuthority(authority));
  }

  public static boolean isAuthenticated() {
    return !getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ANONYMOUS"));
  }
}
