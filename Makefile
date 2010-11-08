VOWS=vows/{blob,branch,commit,raw,repo,tree,user}.js

spec:
	vows --spec $(VOWS)

test:
	vows $(VOWS)
