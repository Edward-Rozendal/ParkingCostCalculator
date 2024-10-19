Feature: Valet Parking feature
  The parking lot calculator calculates cost for Valet Parking.

  Scenario: Calculate Valet Parking Cost for half an hour
    When I park my car in the "Valet" Parking Lot for 30 minutes
    Then I will have to pay $ 12.00
