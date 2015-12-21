DROP DATABASE IF EXISTS Forum;
CREATE DATABASE Forum;

USE Forum;

CREATE TABLE Users(
	uid INT PRIMARY KEY AUTO_INCREMENT,
    uname VARCHAR(12) NOT NULL,
    date_joined DATETIME DEFAULT NOW(),
    passwd VARCHAR(64) NOT NULL,
    UNIQUE KEY(uname)
);

CREATE TABLE Followers(
	follower_id INT,
    followed_id INT,
    tag VARCHAR(20),
    PRIMARY KEY(follower_id, followed_id, tag),
    FOREIGN KEY(follower_id)
		REFERENCES Users(uid)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY(followed_id)
		REFERENCES Users(uid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Posts(
	pid INT PRIMARY KEY AUTO_INCREMENT,
    uid INT,
    title VARCHAR(140) NOT NULL,
    link VARCHAR(2000),
    date_posted DATETIME DEFAULT NOW(),
    content VARCHAR(10000),
    FOREIGN KEY(uid)
		REFERENCES Users(uid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE PostTags(
	pid INT,
    tag VARCHAR(20),
    PRIMARY KEY(pid, tag),
    FOREIGN KEY(pid)
		REFERENCES Posts(pid)
		ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Shares(
	uid INT,
    pid INT,
    date_shared DATETIME DEFAULT NOW(),
    PRIMARY KEY(uid, pid),
    FOREIGN KEY(uid)
		REFERENCES Users(uid)
		ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY(pid)
		REFERENCES Posts(pid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Comments(
	cid INT PRIMARY KEY AUTO_INCREMENT,
    pid INT,
    uid INT,
    date_commented DATETIME DEFAULT NOW(),
    content VARCHAR(3000) NOT NULL,
    FOREIGN KEY(pid)
		REFERENCES Posts(pid)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY(uid)
		REFERENCES Users(uid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE CommentTree(
	parent_id INT,
    child_id INT,
    depth INT,
    PRIMARY KEY(parent_id, child_id),
    FOREIGN KEY(parent_id)
		REFERENCES Comments(cid)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY(child_id)
		REFERENCES Comments(cid)
		ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Groups (
	gid INT PRIMARY KEY AUTO_INCREMENT,
    gname VARCHAR(20) NOT NULL,
    date_formed DATETIME DEFAULT NOW()
);

CREATE TABLE GroupMembers(
	uid INT,
    gid INT,
    PRIMARY KEY(uid, gid),
    FOREIGN KEY(uid)
		REFERENCES Users(uid)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY(gid)
		REFERENCES Groups(gid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE GroupCurators(
	uid INT,
    gid INT,
    tag VARCHAR(20),
    PRIMARY KEY(uid, gid, tag),
    FOREIGN KEY(uid)
		REFERENCES Users(uid)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY(gid)
		REFERENCES Groups(gid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE GroupMessages(
	mid INT PRIMARY KEY AUTO_INCREMENT,
    uid INT,
    gid INT,
    msg VARCHAR(140) NOT NULL,
    msg_date DATETIME DEFAULT NOW(),
    FOREIGN KEY(uid)
		REFERENCES Users(uid)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY(gid)
		REFERENCES Groups(gid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE GroupMessageTags(
	mid INT,
    tag VARCHAR(20) NOT NULL,
    PRIMARY KEY(mid, tag),
    FOREIGN KEY(mid)
		REFERENCES GroupMessages(mid)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);