package servlet;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/session")
public class SessionServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result =
                new HashMap<>();

        HttpSession session =
                request.getSession(false);

        if (session == null ||
                session.getAttribute("userId") == null) {

            result.put("loggedIn", false);

            response.getWriter().write(
                    gson.toJson(result)
            );

            return;
        }

        result.put("loggedIn", true);
        result.put(
                "userId",
                session.getAttribute("userId")
        );
        result.put(
                "username",
                session.getAttribute("username")
        );

        response.getWriter().write(
                gson.toJson(result)
        );
    }
}