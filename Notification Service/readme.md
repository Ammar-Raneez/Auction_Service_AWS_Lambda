### add an email into Amazon SES and verify that mail

# Amazon SQS
## Any services that need to send an email, send the messages
## To this queue, and the queue will send them one-by-one
## to the notification service, so it can send the emails
## at its own pace, preventing unneeded traffic.