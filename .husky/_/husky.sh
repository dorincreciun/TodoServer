#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_root="$(dirname "$0")/../.."
  readonly hook_dir="$husky_root/.husky"
  readonly hook="$hook_dir/$hook_name"

  if [ -f "$hook" ]; then
    debug "running $hook"
    . "$hook"
  else
    debug "hook not found: $hook"
  fi
fi 