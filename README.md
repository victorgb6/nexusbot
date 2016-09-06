#Ping Pong Bot for Telegram

####It's a Telegram bot to save ping pong matches results.

##Available Commands

* **/register**: Register a player with his Telegram user in the database.
* **/challenge <@user>**: Sends a challenge to the user enter at first parameter.
* **/accept**: Accept a challenge if the user has one pending.
* **/decline**: Decline a challenge if the user has one pending.
* **/resign**: Resign a match that has already been accepted.
* **/lost [your set score]:[their set score],[your set score]:[their set score]:**: The player who lost a match must input the score with the current format.
* **/rank <@user>**: Get the wins/loses from that user, if not user specified it returns the stats from the current user.
