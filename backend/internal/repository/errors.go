package repository

import "errors"

var ErrEmailExists = errors.New("email already exists")
var NoMeetingYet = errors.New("no meeting yet")
