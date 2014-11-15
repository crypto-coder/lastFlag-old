

INSERT INTO `lastFlag`.`Currency` (`otAssetID`, `name`, `totalCreated`, `tla`, `numberOfDecimals`)
VALUES ('dky86RGUPSAhdjcf6AyDtNtiFLvzfMdMa83b53WLXbI', 'hacker coins', 100, 'hks', 0);


INSERT INTO `lastFlag`.`lastFlagUser` (`username`, `password`, `email`, `otNymID`)
VALUES ('test', '$2a$10$NdZxsagMZBYd21JZPpTgHOoqotSHgmlSt2qKG8M562vie.hO7IjFC', 'test@test.com', 'FJolEMvVujXHV6f0LAGLLCWM5gG4n8EjEVRF4OHRN5D');


INSERT INTO `lastFlag`.`Account` (`otNymID`, `otAccountID`, `name`, `accountType`, `balance`, `balanceDate`, `userID`, `currencyID`)
VALUES ('FJolEMvVujXHV6f0LAGLLCWM5gG4n8EjEVRF4OHRN5D', 'QfOkqY7X05pSc7asfsv15w4fWThVKnpLHXYDj1G3fJh', 'test - Main Account', 'D', 0, CURDATE(), 1, 1);

INSERT INTO `lastFlag`.`Account` (`otNymID`, `otAccountID`, `name`, `accountType`, `balance`, `balanceDate`, `userID`, `currencyID`)
VALUES ('ya1AQQmaWnuntmDnoOjCmKpPXhmGuVAfkPwrgSc3nlf', 'oYeRsNAzcf0IcuqNEVtCdvW0fmt5F3FRucTJcygMcUd', 'Hackercoin - Comptroller Account', 'C', 100, CURDATE(), 1, 1);

INSERT INTO `lastFlag`.`Account` (`otNymID`, `otAccountID`, `name`, `accountType`, `balance`, `balanceDate`, `userID`, `currencyID`)
VALUES ('FJolEMvVujXHV6f0LAGLLCWM5gG4n8EjEVRF4OHRN5D', 'MtBJmjl6FXD51lnSAgENXwXh748BRe7j5TDd0vf8OXd', 'Hackercoin - Issuer Account', 'I', -100, CURDATE(), 1, 1);


INSERT INTO `lastFlag`.`Transaction` (`amount`, `creationDate`, `memo`, `sourceAccountID`, `destinationAccountID`)
VALUES (10, '2014-10-01', 'test1', 2, 1);

INSERT INTO `lastFlag`.`Transaction` (`amount`, `creationDate`, `memo`, `sourceAccountID`, `destinationAccountID`)
VALUES (10, '2014-10-02', 'test2', 2, 1);