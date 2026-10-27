package servlet;

import com.google.gson.Gson;
import dao.UserDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.User;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result = new HashMap<>();

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        if (username == null || password == null ||
                username.isBlank() || password.isBlank()) {

            result.put("success", false);
            result.put("message", "Username and password are required.");

            response.getWriter().write(gson.toJson(result));
            return;
        }

        User user = userDAO.findByUsername(username);

        if (user == null ||
                !BCrypt.checkpw(password, user.getPasswordHash())) {

            result.put("success", false);
            result.put("message", "Invalid username or password.");

            response.getWriter().write(gson.toJson(result));
            return;
        }

        HttpSession session = request.getSession();
        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());

        result.put("success", true);
        result.put("message", "Login successful.");
        result.put("userId", user.getId());
        result.put("username", user.getUsername());

        response.getWriter().write(gson.toJson(result));
    }
}