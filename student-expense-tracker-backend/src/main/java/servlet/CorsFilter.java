package servlet;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebFilter("/*")
public class CorsFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest =
                (HttpServletRequest) request;

        HttpServletResponse httpResponse =
                (HttpServletResponse) response;

        String origin =
                httpRequest.getHeader("Origin");

        if (
                "http://localhost:5500".equals(origin) ||
                "http://127.0.0.1:5500".equals(origin)
        ) {

            httpResponse.setHeader(
                    "Access-Control-Allow-Origin",
                    origin
            );

            httpResponse.setHeader(
                    "Access-Control-Allow-Credentials",
                    "true"
            );

            httpResponse.setHeader(
                    "Access-Control-Allow-Methods",
                    "GET, POST, PUT, DELETE, OPTIONS"
            );

            httpResponse.setHeader(
                    "Access-Control-Allow-Headers",
                    "Content-Type"
            );

            httpResponse.setHeader(
                    "Vary",
                    "Origin"
            );
        }

        if ("OPTIONS".equalsIgnoreCase(
                httpRequest.getMethod()
        )) {

            httpResponse.setStatus(
                    HttpServletResponse.SC_OK
            );

            return;
        }

        chain.doFilter(
                request,
                response
        );
    }
}