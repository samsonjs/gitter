VOWS=vows/{blob,branch,commit,repo,tree,user}.js

spec:
	vows --spec $(VOWS)

test:
	vows $(VOWS)
