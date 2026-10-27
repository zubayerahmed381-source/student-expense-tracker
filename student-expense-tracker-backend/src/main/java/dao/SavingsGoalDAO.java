package dao;

import model.SavingsGoal;
import util.DBConnection;

import java.sql.*;

public class SavingsGoalDAO {

    public boolean save(SavingsGoal goal) {

        String sql = """
                INSERT INTO savings_goals
                (user_id, goal_amount)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE
                goal_amount = VALUES(goal_amount)
                """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, goal.getUserId());
            stmt.setBigDecimal(2, goal.getGoalAmount());

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {

            e.printStackTrace();
            return false;
        }
    }

    public SavingsGoal findByUserId(Long userId) {

        String sql = """
                SELECT id, user_id, goal_amount
                FROM savings_goals
                WHERE user_id = ?
                """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {

                return new SavingsGoal(
                        rs.getLong("id"),
                        rs.getLong("user_id"),
                        rs.getBigDecimal("goal_amount")
                );
            }

        } catch (SQLException e) {

            e.printStackTrace();
        }

        return null;
    }
}