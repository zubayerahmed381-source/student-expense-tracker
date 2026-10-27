
package model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Budget {

    private Long id;
    private Long userId;
    private LocalDate budgetMonth;
    private BigDecimal amount;
    private String category;

    public Budget() {
    }

    public Budget(Long id, Long userId, LocalDate budgetMonth,
                  BigDecimal amount, String category) {
        this.id = id;
        this.userId = userId;
        this.budgetMonth = budgetMonth;
        this.amount = amount;
        this.category = category;
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

    public LocalDate getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(LocalDate budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
