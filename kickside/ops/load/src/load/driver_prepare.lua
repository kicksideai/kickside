type Map = { [string]: any }

local support = require("driver_support")
local fail = support.fail
local exec = support.exec
local state_set = support.state_set
local create_thread = support.create_thread

local M = {}

function M.prepare(): Map
    local user_repo = require("user_repo")
    local user_groups_repo = require("user_groups_repo")
    -- The runtime's bootloader startup gate holds process entries until all
    -- registered migrations finish. Do not recreate that gate with harness
    -- polling here.
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_state(key TEXT PRIMARY KEY,value TEXT NOT NULL)]])
    local created, user_err = user_repo.create_passwordless({ user_id = "lane_lod_owner",
        email = "lane-lod-owner@example.invalid", full_name = "Lane LOD Owner" })
    if user_err or not created then fail("load owner provisioning failed: " .. tostring(user_err)) end
    local assigned, group_err = user_groups_repo.assign_user_to_group("lane_lod_owner", "wippy.security:process")
    if group_err or not assigned then fail("load owner group assignment failed: " .. tostring(group_err)) end
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_metric(
        metric TEXT PRIMARY KEY,target TEXT NOT NULL,measured TEXT NOT NULL,status TEXT NOT NULL,detail TEXT NOT NULL DEFAULT '')]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_provider_receipt(
        automation_id TEXT NOT NULL,item_key TEXT NOT NULL,observed_at TEXT NOT NULL,
        PRIMARY KEY(automation_id,item_key))]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_page_observation(
        automation_id TEXT NOT NULL,drive_key TEXT NOT NULL,item_count INTEGER NOT NULL,
        observed_at TEXT NOT NULL)]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_outage_observation(
        tick INTEGER PRIMARY KEY,unresolved INTEGER NOT NULL,unresolved_bytes INTEGER NOT NULL,
        pending_wakes INTEGER NOT NULL,observed_at TEXT NOT NULL)]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_observation(
        observed_at TIMESTAMPTZ NOT NULL,xact_age_ms DOUBLE PRECISION NOT NULL,
        lock_waiters INTEGER NOT NULL,lock_age_ms DOUBLE PRECISION NOT NULL,deadlocks BIGINT NOT NULL,
        hot_statement TEXT NOT NULL DEFAULT '')]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_lock_observation(
        observed_at TIMESTAMPTZ NOT NULL,pid BIGINT NOT NULL,blocking_pids TEXT NOT NULL,
        locktype TEXT NOT NULL,relation_name TEXT,mode TEXT NOT NULL,wait_ms DOUBLE PRECISION NOT NULL,
        query_text TEXT NOT NULL)]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_watch_baseline(
        automation_id TEXT NOT NULL,drive_key TEXT NOT NULL,job_id TEXT NOT NULL,
        execution_seq BIGINT NOT NULL,PRIMARY KEY(automation_id,drive_key))]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_source_threads(
        ordinal INTEGER PRIMARY KEY,thread_id TEXT NOT NULL)]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_automations(
        ordinal INTEGER PRIMARY KEY,id TEXT NOT NULL,thread_id TEXT NOT NULL)]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_timer_automations(
        ordinal INTEGER PRIMARY KEY,id TEXT NOT NULL)]])
    exec([[CREATE TABLE IF NOT EXISTS kickside_lod_round_baseline(
        automation_id TEXT NOT NULL,drive_key TEXT NOT NULL,job_id TEXT NOT NULL,
        round_seq BIGINT NOT NULL,execution_seq BIGINT NOT NULL,last_round_at TEXT,
        completed INTEGER NOT NULL DEFAULT 0,job_completed INTEGER NOT NULL DEFAULT 0,
        observed_at TEXT,
        PRIMARY KEY(automation_id,drive_key))]])
    local source_thread = create_thread("source")
    local prune_thread = create_thread("prune")
    state_set("source_thread_id", source_thread)
    state_set("prune_thread_id", prune_thread)
    exec("INSERT INTO kickside_lod_source_threads(ordinal,thread_id) VALUES(1,$1)", { source_thread })
    state_set("monitor_stop", "0")
    return { source_thread_id = source_thread, prune_thread_id = prune_thread }
end

return M
