Feature: Valet Parking feature
  The parking lot calculator can calculate costs for Valet Parking.

  Scenario: Calculate Valet Parking Cost
    When I park my car in the "Valet" Parking Lot for <parking duration>
    Then I will have to pay $ <parking costs>

  Examples:
    | parking duration | parking costs |
    | 30 minutes       | 12.00         |
