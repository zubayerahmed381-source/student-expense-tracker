package servlet;

import com.google.gson.Gson;
import dao.UserDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.User;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/register")
public class RegisterServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, String> result = new HashMap<>();

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        if (username == null || password == null ||
                username.isBlank() || password.isBlank()) {

            result.put("success", "false");
            result.put("message", "Username and password are required.");

            response.getWriter().write(gson.toJson(result));
            return;
        }

        if (userDAO.findByUsername(username) != null) {

            result.put("success", "false");
            result.put("message", "Username already exists.");

            response.getWriter().write(gson.toJson(result));
            return;
        }

        String hashedPassword = BCrypt.hashpw(
                password,
                BCrypt.gensalt()
        );

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(hashedPassword);

        boolean success = userDAO.register(user);

        result.put("success", String.valueOf(success));

        if (success) {
            result.put("message", "Registration successful.");
        } else {
            result.put("message", "Registration failed.");
        }

        response.getWriter().write(gson.toJson(result));
    }
}