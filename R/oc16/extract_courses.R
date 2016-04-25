setwd('/home/madjid/dev/CoReaDa/R/oc16')
fulldata = read.csv2('USER_COURSE_VISUALISATION.csv', stringsAsFactors=FALSE)

nodejs=fulldata[which(fulldata$course_id==1056721),]
nothing = min(as.character(nodejs$session_id))
nodejs=nodejs[which(nodejs$session_id!=nothing),]

nodejs = nodejs[which(!is.na(nodejs$part_id)),]
nodejs=unique(nodejs)
colnames(nodejs)[4]="date"
nodejs$date = as.POSIXct(nodejs$date)
nodejs=nodejs[order(nodejs$date),]  
rownames(nodejs)=1:nrow(nodejs)
nodejs$id=1:nrow(nodejs)
save(nodejs, file='nodejs.rdata')


java=fulldata[which(fulldata$course_id==26832),] 
nothing = min(as.character(java$session_id))
java=java[which(java$session_id!=nothing),]
java = java[which(!is.na(java$part_id)),]
java=unique(java)
colnames(java)[4]="date"
java$date = as.POSIXct(java$date)
java=java[order(java$date),]  
rownames(java)=1:nrow(java)
java$id=1:nrow(java)
save(java, file='java.rdata')

entreprendre=fulldata[which(fulldata$course_id==1946116),] # nrow = 
nothing = min(as.character(entreprendre$session_id))
entreprendre=entreprendre[which(entreprendre$session_id!=nothing),]
entreprendre = entreprendre[which(!is.na(entreprendre$part_id)),]
entreprendre=unique(entreprendre)
colnames(entreprendre)[4]="date"
entreprendre$date = as.POSIXct(entreprendre$date)
entreprendre=entreprendre[order(entreprendre$date),]  
rownames(entreprendre)=1:nrow(entreprendre)
entreprendre$id=1:nrow(entreprendre)
save(entreprendre, file='entreprendre.rdata')

xml=fulldata[which(fulldata$course_id==1766341),] # nrow = 
nothing = min(as.character(xml$session_id))
xml=xml[which(xml$session_id!=nothing),]
xml = xml[which(!is.na(xml$part_id)),]
xml=unique(xml)
colnames(xml)[4]="date"
xml$date = as.POSIXct(xml$date)
xml=xml[order(xml$date),]  
rownames(xml)=1:nrow(xml)
xml$id=1:nrow(xml)
save(xml, file='xml.rdata')

