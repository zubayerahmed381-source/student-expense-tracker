package model;

import java.math.BigDecimal;

public class SavingsGoal {

    private Long id;
    private Long userId;
    private BigDecimal goalAmount;

    public SavingsGoal() {
    }

    public SavingsGoal(Long id, Long userId, BigDecimal goalAmount) {
        this.id = id;
        this.userId = userId;
        this.goalAmount = goalAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getGoalAmount() {
        return goalAmount;
    }

    public void setGoalAmount(BigDecimal goalAmount) {
        this.goalAmount = goalAmount;
    }
}