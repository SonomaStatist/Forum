USE Forum;

DROP PROCEDURE IF EXISTS NewPostsFromFollowed;
DROP PROCEDURE IF EXISTS NewPostsFromUser;
DROP PROCEDURE IF EXISTS NewPostsToAllByTag;
DROP PROCEDURE IF EXISTS NewPostsToGroup;
DROP PROCEDURE IF EXISTS NewPostsToGroupByCurator;
DROP PROCEDURE IF EXISTS GetCommentReplies;
DROP PROCEDURE IF EXISTS GetPostReplies;
DROP PROCEDURE IF EXISTS GetPostAndComments;
DROP PROCEDURE IF EXISTS GetPostAndCommentContext;
DROP PROCEDURE IF EXISTS NewGroupMessagesByTag;
DROP PROCEDURE IF EXISTS GetGroupMembers;
DROP PROCEDURE IF EXISTS GetGroupCurators;
DROP PROCEDURE IF EXISTS AddCommentReply;
DROP PROCEDURE IF EXISTS AddPostReply;
DROP PROCEDURE IF EXISTS AddPost;
DROP PROCEDURE IF EXISTS AddGroupMember;
DROP PROCEDURE IF EXISTS AddGroupCurator;
DROP PROCEDURE IF EXISTS AddGroupMessage;
DROP PROCEDURE IF EXISTS AddNewUser;
DROP PROCEDURE IF EXISTS IsFollower;

DELIMITER //
CREATE PROCEDURE NewPostsFromFollowed (user_id INT)
BEGIN
	SELECT 
		N.* 
	FROM NewPostsToAll N
		JOIN PostTags PT ON N.post_id = PT.pid
	WHERE 
		EXISTS (
			SELECT 
				* 
			FROM 
				Followers F 
			WHERE 
				F.follower_id = user_id AND 
                F.followed_id = N.poster_id AND
				(
					F.tag = 'all' OR 
                    F.tag = PT.tag
				)
			)
	GROUP BY N.post_id
    ORDER BY N.date_posted DESC;
END //

DELIMITER //
CREATE PROCEDURE NewPostsFromUser (_username VARCHAR(12))
BEGIN
	SELECT 
		N.* 
	FROM NewPostsToAll N
		JOIN PostTags PT ON N.post_id = PT.pid
	WHERE N.username = _username
	GROUP BY N.post_id
    ORDER BY N.date_posted DESC;
END //

DELIMITER //
CREATE PROCEDURE NewPostsToAllByTag (fetch_tag VARCHAR(20))
BEGIN
	SELECT 
		N.* 
	FROM NewPostsToAll N
		JOIN PostTags T ON N.post_id = T.pid
	WHERE T.tag = fetch_tag
    GROUP BY N.post_id
    ORDER BY N.date_posted DESC;
END //

DELIMITER //
CREATE PROCEDURE NewPostsToGroup (group_name VARCHAR(20))
BEGIN
	SELECT 
		N.*
	FROM NewPostsToAll N
		LEFT JOIN PostTags T ON N.post_id = T.pid
        JOIN GroupCurators C ON N.user_id = C.uid
        JOIN Groups G ON C.gid = G.gid
	WHERE G.gname = group_name
		AND (C.tag = 'all' OR C.tag = T.tag)
	GROUP BY N.post_id
    ORDER BY N.date_posted DESC;
END //

DELIMITER //
CREATE PROCEDURE NewPostsToGroupByCurator(group_name VARCHAR(20), curator VARCHAR(12))
BEGIN
	SELECT 
		N.*
	FROM NewPostsToAll N
		LEFT JOIN PostTags T ON N.post_id = T.pid
        JOIN GroupCurators C ON N.user_id = C.uid
        JOIN Groups G ON C.gid = G.gid
	WHERE G.gname = group_name
		AND N.username = curator
		AND (C.tag = 'all' OR C.tag = T.tag)
	GROUP BY N.post_id
    ORDER BY N.date_posted DESC;
END //

DELIMITER //
CREATE PROCEDURE GetCommentReplies (root_id INT)
BEGIN
	SELECT 	
		C.cid AS comment_id,
        U.uname AS username,
        U.uid AS user_id,
		C.date_commented,
        C.content AS comment_body,
        T.parent_id AS parent_id,
        0 AS depth,
        LPAD(HEX(C.cid), 8, '0') AS sort_str
	FROM Comments C
		JOIN CommentTree T ON C.cid = T.parent_id
        JOIN Users U ON C.uid = U.uid
	WHERE T.child_id = root_id
		AND T.depth > 0
    UNION ALL
    SELECT 	
		C.cid AS comment_id,
		U.uname AS username,
        U.uid AS user_id,
		C.date_commented,
        C.content AS comment_body,
        CT.parent_id AS parent_id,
        T.depth AS depth,
        S.sort_str
	FROM Comments C
		JOIN CommentTree T ON C.cid = T.child_id
	    JOIN Users U ON C.uid = U.uid
        JOIN CommentTree CT ON C.cid = CT.child_id
        JOIN (SELECT 
					Cs.cid, 
					GROUP_CONCAT(LPAD(HEX(CTs.parent_id), 8, '0') SEPARATOR '') AS sort_str
				FROM Comments Cs
					JOIN CommentTree CTs ON Cs.cid = CTs.child_id
				GROUP BY Cs.cid
                ORDER BY Cs.cid, CTs.parent_id
			) S ON S.cid = C.cid
	WHERE T.parent_id = root_id
		AND CT.depth = 1
	ORDER BY sort_str;
END //

DELIMITER //
CREATE PROCEDURE GetPostReplies (post_id INT)
BEGIN
	SELECT 	
		C.cid AS comment_id,
        U.uname AS username,
        U.uid AS user_id,
		C.date_commented,
        C.content AS comment_body,
        T.parent_id AS parent_id,
        0 AS depth,
        LPAD(HEX(C.cid), 8, '0') AS sort_str
	FROM Comments C
		JOIN CommentTree T ON C.cid = T.parent_id
        JOIN Users U ON C.uid = U.uid
	WHERE T.child_id IN (SELECT R.comment_id FROM RootComments R WHERE R.post_id = post_id)
    UNION ALL
    SELECT 	
		C.cid AS comment_id,
		U.uname AS username,
        U.uid AS user_id,
		C.date_commented,
        C.content AS comment_body,
        CT.parent_id AS parent_id,
        T.depth AS depth,
        S.sort_str
	FROM Comments C
		JOIN CommentTree T ON C.cid = T.child_id
	    JOIN Users U ON C.uid = U.uid
        JOIN CommentTree CT ON C.cid = CT.child_id
        JOIN (SELECT 
					Cs.cid, 
					GROUP_CONCAT(LPAD(HEX(CTs.parent_id), 8, '0') SEPARATOR '') AS sort_str
				FROM Comments Cs
					JOIN CommentTree CTs ON Cs.cid = CTs.child_id
				GROUP BY Cs.cid
                ORDER BY Cs.cid, CTs.parent_id
			) S ON S.cid = C.cid
	WHERE T.parent_id IN (SELECT R.comment_id FROM RootComments R WHERE R.post_id = post_id)
		AND CT.depth = 1
	GROUP BY C.cid
	ORDER BY sort_str;
END //

DELIMITER //
CREATE PROCEDURE GetPostAndComments(_post_id INT)
BEGIN
	SELECT 
		* 
	FROM PostDetails P 
    WHERE P.post_id = _post_id;
    
    CALL GetPostReplies(_post_id);
END //

DELIMITER //
CREATE PROCEDURE GetPostAndCommentContext(_post_id INT, _comment_id INT)
BEGIN
	SELECT
		*
	FROM PostDetails P 
    WHERE P.post_id = _post_id;
    
    CALL GetCommentReplies(_comment_id);
END //

DELIMITER //
CREATE PROCEDURE NewGroupMessagesByTag (group_name VARCHAR(20), fetch_tag VARCHAR(20))
BEGIN
	SELECT 
		N.*,
        GROUP_CONCAT(T.tag SEPARATOR ' ') AS tags
	FROM NewGroupMessages N 
		JOIN GroupMessageTags T ON N.message_id = T.mid
	WHERE (fetch_tag = 'all' OR T.tag = fetch_tag)
		AND N.groupname = group_name
	GROUP BY N.message_id
    ORDER BY N.date_messaged ASC;
END //
		
DELIMITER //
CREATE PROCEDURE GetGroupMembers (group_name VARCHAR(20), user_id INT)
BEGIN
	SELECT 
		M.uid 
	FROM GroupMembers M
		JOIN Groups G ON M.gid = G.gid
	WHERE M.uid = user_id
		AND G.gname = group_name
	GROUP BY M.uid;
END //

DELIMITER //
CREATE PROCEDURE GetGroupCurators (group_name VARCHAR(20))
BEGIN
	SELECT
		U.uname AS username,
        GROUP_CONCAT(C.tag SEPARATOR ' ') AS tags
	FROM Groups G
		JOIN GroupCurators C ON G.gid = C.gid
        JOIN Users U ON U.uid = C.uid
	WHERE G.gname = group_name
	GROUP BY U.uid
    ORDER BY U.uname ASC;
END //
        
DELIMITER //
CREATE PROCEDURE AddPostReply (post_id INT, user_id INT, reply_content VARCHAR(3000))
BEGIN
	INSERT INTO Comments (uid, pid, content) VALUES
		(user_id, post_id, reply_content);
	
    SELECT LAST_INSERT_ID() INTO @reply_id;
    
    INSERT INTO CommentTree (parent_id, child_id, depth) VALUES
		(@reply_id, @reply_id, 0);
	
    SELECT @reply_id AS reply_id;
END //
    
DELIMITER //
CREATE PROCEDURE AddCommentReply (post_id INT, comment_id INT, user_id INT, reply_content VARCHAR(3000))
BEGIN
	INSERT INTO Comments (uid, pid, content) VALUES
		(user_id, post_id, reply_content);
	
    SELECT LAST_INSERT_ID() INTO @reply_id;
	
    INSERT INTO CommentTree (parent_id, child_id, depth)
    SELECT 
		T.parent_id,
        @reply_id,
        T.depth + 1
	FROM (
		SELECT
			*
		FROM CommentTree C
		WHERE C.child_id = comment_id
        ) T;
	
    INSERT INTO CommentTree (parent_id, child_id, depth) VALUES
		(@reply_id, @reply_id, 0);
	
    SELECT @reply_id AS reply_id;
END //
    
DELIMITER //
CREATE PROCEDURE AddPost (user_id INT, post_title VARCHAR(140), post_link VARCHAR(2000), post_content VARCHAR(10000))
BEGIN
	INSERT INTO Posts (uid, title, link, content) VALUES (user_id, post_title, post_link, post_content);
    SELECT LAST_INSERT_ID() AS post_id;
END //
    
DELIMITER //
CREATE PROCEDURE AddGroupMember (group_name VARCHAR(20), user_id INT)
BEGIN
	INSERT INTO GroupMembers (gid, uid) 
		(SELECT 
			G.gid, 
            user_id 
		FROM Groups G 
        WHERE G.gname = group_name);
END //
    
DELIMITER //
CREATE PROCEDURE AddGroupCurator (group_name VARCHAR(20), user_id INT, _tag VARCHAR(20))
BEGIN
	INSERT INTO GroupCurators (gid, uid, tag)
		(SELECT 
			G.gid, 
			user_id, 
            _tag 
		FROM Groups G 
        WHERE G.gname = group_name);
END //

DELIMITER //
CREATE PROCEDURE AddGroupMessage (group_name VARCHAR(20), user_id INT, message_content VARCHAR(140), _tag VARCHAR(20))
BEGIN
	INSERT INTO GroupMessages (gid, uid, msg)
		(SELECT 
			G.gid, 
			user_id, 
            message_content 
		FROM Groups G 
        WHERE G.gname = group_name);
    
    SELECT LAST_INSERT_ID() INTO @message_id;
    
    INSERT INTO GroupMessageTags (mid, tag) VALUES (@message_id, _tag);
END //
    
DELIMITER //
CREATE PROCEDURE AddNewUser (username VARCHAR(12), password varchar(64))
BEGIN
    INSERT INTO Users (uname, passwd) VALUES (username, password);
	
    SELECT LAST_INSERT_ID() INTO @user_id;
    
    SELECT 
		uid AS user_id,
        uname AS username,
        passwd AS password
    FROM Users U 
    WHERE U.uid = @user_id;
END //
    
DELIMITER //
CREATE PROCEDURE IsFollower (follower INT, username VARCHAR(12))
BEGIN
	SELECT 
		*
	FROM Users U
		JOIN Followers F ON U.uid = F.followed_id
	WHERE F.follower_id = follower
		AND U.uname = username;
END //
    
    
    
    
    
    
    
    
    
    
    