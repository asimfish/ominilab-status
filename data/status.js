window.STATUS = {
 "updated": "2026-11-15 20:50",
 "tz": "UTC+8",
 "snapshots_taken": "11-15 19:57",
 "session": {
  "online": true,
  "expires": "11-15 23:26",
  "note": "Live until 23:26 (Beijing time). Debug view only: physics starts paused, and rooms that have not passed their checks stay labelled as such. Open your SSH tunnel on port 18621, pick a scene, then press Open live."
 },
 "default_port": 18621,
 "groups": [
  {
   "id": "base",
   "title": "Base scenes",
   "blurb": "5 original scenes and 7 new rooms. Each shows its latest snapshot; with a live session it opens in Isaac Sim to play, pause, reset, move the camera and inspect instruments.",
   "items": [
    {
     "id": "legacy_l0",
     "title": "Intelligent chemistry robot platform",
     "tag": "Base",
     "live": true,
     "status": "pass",
     "line": "Passes the strict 600-step stability test",
     "details": "A three-neck flask that tipped at step 7 is fixed. Full sweep: 0 blockers.",
     "img": "assets/snapshots/legacy_l0.jpg"
    },
    {
     "id": "legacy_l1",
     "title": "Organic synthesis lab",
     "tag": "Base",
     "live": true,
     "status": "pass",
     "line": "Passes the strict 600-step stability test",
     "details": "A pestle that tipped at step 5 is fixed. Full sweep: 0 blockers.",
     "img": "assets/snapshots/legacy_l1.jpg"
    },
    {
     "id": "legacy_l2",
     "title": "Analysis centre + weighing unit",
     "tag": "Base",
     "live": true,
     "status": "pass",
     "line": "Passes the strict 600-step stability test",
     "details": "Holds the pilot balance station. A 50 ml beaker standing on a 0.4 mm contact point got a 1 mm flat foot; the dispenser, oven and titrator repairs hold.",
     "img": "assets/snapshots/legacy_l2.jpg"
    },
    {
     "id": "legacy_l3",
     "title": "Electrochemistry & energy materials lab",
     "tag": "Base",
     "live": true,
     "status": "pass",
     "line": "Passes the strict 600-step stability test",
     "details": "A free-standing vessel that tipped at step 1 is fixed. Full sweep: 0 blockers.",
     "img": "assets/snapshots/legacy_l3.jpg"
    },
    {
     "id": "legacy_l4",
     "title": "FR3 100 mL weighing & recovery unit",
     "tag": "Base",
     "live": true,
     "status": "pass",
     "line": "Passes the strict 600-step stability test",
     "details": "Two sample objects had been placed 7 mm above their support; with a 1 mm gap the room passes.",
     "img": "assets/snapshots/legacy_l4.jpg"
    },
    {
     "id": "room_double_island",
     "title": "Double-island wet-chemistry hall",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft room, not structurally complete. 87 unstable parts; cause analysis done, fixes prepared",
     "details": "By evidence: 42 are cable links held by constrained joints, 40 have a position drive but still move (2 of them, a micropipette button and dial, have a drive target that differs from the starting pose), 5 lack a restoring drive. Nearly all root parts start with overlapping collision shapes; fixes are prepared for the next run.",
     "img": "assets/snapshots/room_double_island.jpg"
    },
    {
     "id": "room_u_workcell",
     "title": "U-shaped bio / electrochemistry cell",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft room, not structurally complete. 98 unstable parts; start-up overlap confirmed as the cause for the main instrument; fix proven on 1 of 6 heads",
     "details": "About 40 root causes sit behind the moving parts in the new rooms. On the WTW OxiTop here, each of the six sensor heads starts with its collision shape 24.000 mm inside its sleeve, and each head jumps 24.0001 mm on the first step, a match to five digits. A collision-shape fix for one head and a latch are both prepared, with an untouched control, for the next run. Not yet confirmed in the simulator.",
     "img": "assets/snapshots/room_u_workcell.jpg"
    },
    {
     "id": "room_linear_flow",
     "title": "Continuous-flow corridor",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft room, not structurally complete. 12 unstable parts; one cause matched to a starting overlap",
     "details": "A desorber lid starts 25.422 mm inside a neighbouring tube and jumps 25.422 mm on start-up. 6 other parts are robot gripper parts whose source model is not available locally.",
     "img": "assets/snapshots/room_linear_flow.jpg"
    },
    {
     "id": "room_l_suite",
     "title": "L-shaped digestion / separation suite",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft room, not structurally complete. 23 unstable parts; cause analysis done",
     "details": "21 have a position drive but still move, 1 has a non-zero speed target, 1 lacks a restoring drive. Two valves turn to their 180° stop on the first step; a latch test with a control is prepared.",
     "img": "assets/snapshots/room_l_suite.jpg"
    },
    {
     "id": "room_spine_analysis",
     "title": "Six-bay analysis centre",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft room, not structurally complete. Crashes at step 1; narrowed to two groups of 7 instruments; single-instrument runs next",
     "details": "Two groups of 13 and 14 instruments each crash at step 1; 7 narrowing cases are prepared.",
     "img": "assets/snapshots/room_spine_analysis.jpg"
    },
    {
     "id": "room_racetrack",
     "title": "Ring logistics hall",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft room, not structurally complete. Crash not reproduced with the suspect instrument split in four; those runs timed out before finishing",
     "details": "Runs all 660 steps without the particle-size analyser. That instrument crashes as a whole but each half runs, so no single part is isolated yet; 7 narrowing cases are prepared.",
     "img": "assets/snapshots/room_racetrack.jpg"
    },
    {
     "id": "room_inert_suite",
     "title": "Inert multi-room suite",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft room, not structurally complete. 22 unstable parts; the glovebox passes alone with its doors latched; room re-test next",
     "details": "14 have a position drive but still move, 6 are robot gripper parts whose source model is not available locally, 2 lack a restoring drive. The two glovebox doors swing to their 90° stop on the first step; a latch test with a control is prepared.",
     "img": "assets/snapshots/room_inert_suite.jpg"
    },
    {
     "id": "station_centrifuge",
     "title": "Centrifuge station",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft station scene: open shell without a ceiling; to be rebuilt on the room kit",
     "details": "",
     "scene": "round28_centrifuge",
     "img": "assets/snapshots/station_centrifuge.jpg"
    },
    {
     "id": "station_oven",
     "title": "Oven station",
     "tag": "Draft",
     "live": true,
     "status": "fail",
     "line": "Draft station scene: open shell without a ceiling; to be rebuilt on the room kit",
     "details": "",
     "scene": "round28_oven",
     "img": "assets/snapshots/station_oven.jpg"
    }
   ]
  },
  {
   "id": "auto",
   "title": "Auto-built scenes",
   "blurb": "Scenes generated automatically from papers and protocols: one command goes from paper to protocol to scene, and the robot is placed automatically. Five are packaged for the live viewer.",
   "items": [
    {
     "id": "auto_balance_routine_check",
     "title": "Balance routine check (NIST IR 6969)",
     "tag": "From protocol",
     "live": true,
     "status": "pass",
     "line": "Stability test passed; used for the 100 g pilot",
     "details": "Robot bench, robot, balance and reference weights, empty pan with pan lock. Passes the shared support rules (54 checks, 0 fail) and the 600-step stability test. The 100 g pilot package passes its 109 checks.",
     "img": "assets/snapshots/auto_balance_routine_check.jpg"
    },
    {
     "id": "auto_moisture",
     "title": "Moisture by loss on drying",
     "tag": "From protocol",
     "live": false,
     "status": "partial",
     "line": "Passes target-simulator library checks; in-simulator stability run queued",
     "details": "Second pilot. One robot station reaches every pick and place point (0.61 rad joint margin). Sample-pan fixture built from the manual (90 mm pan)."
    },
    {
     "id": "auto_titration",
     "title": "Titration",
     "tag": "From paper",
     "live": false,
     "status": "partial",
     "line": "Re-exported with both collision shapes; passes target-simulator library checks; stability run queued",
     "details": "The titrator's stir bar and piston had no collision shape in the source model. A repair layer now adds one from each part's own visible mesh (convex hull), with nothing invented. The scene is being re-exported and still needs the simulator checks."
    },
    {
     "id": "auto_hplc",
     "title": "HPLC",
     "tag": "From paper",
     "live": false,
     "status": "partial",
     "line": "Passes target-simulator library checks; in-simulator stability run queued",
     "details": "Real instruments, robot and bench. Passes the support check (258 pass, 11 warnings). Waits for the 600-step stability run."
    },
    {
     "id": "auto_liang2021",
     "title": "liang2021",
     "tag": "From paper",
     "live": false,
     "status": "pending",
     "line": "Layout fits 2 robot stations; not run natively",
     "details": ""
    },
    {
     "id": "auto_meloxicam2022",
     "title": "meloxicam2022",
     "tag": "From paper",
     "live": false,
     "status": "partial",
     "line": "Passes target-simulator library checks; in-simulator stability run queued",
     "details": "Real instruments, robot and bench. Passes the support check (360 pass, 12 warnings). Waits for the 600-step stability run."
    },
    {
     "id": "auto_more",
     "title": "13 more source papers",
     "tag": "From paper",
     "live": false,
     "status": "pending",
     "line": "19 papers in the pipeline; none passes full operation yet",
     "details": "Every layout is checked against each instrument's real physics data (moving parts, collision shapes, joints). The pipeline now refuses to overwrite an earlier scene when its inputs change. About 300 native checks are still open."
    }
   ]
  },
  {
   "id": "lab",
   "title": "Lab execution",
   "blurb": "The robot doing real tasks in the simulator. Five skills are approved, pick-and-place included; the first full experiment is next.",
   "items": [
    {
     "id": "lab_skill_trial",
     "title": "Move to pose · planned joint path",
     "tag": "Approved skills",
     "live": false,
     "status": "pass",
     "line": "Both approved after independent re-checks",
     "details": "Move to pose: 16 of 16 trials. Planned joint path: 12 of 12 across 3 independent runs, worst 0.93 mm / 0.10°, refusals correct. Scope: the isolated robot cell."
    },
    {
     "id": "lab_balance_fixture",
     "title": "Balance reading · wait for stable",
     "tag": "Approved skills",
     "live": true,
     "status": "pass",
     "line": "Stable readings; approved for 100 g and 500 g",
     "details": "First stable reading: the 100 g weight read 99.99995 g, settled within 0.01 g one second after release. Approved for 100 g and 500 g in the calibration fixture with a 0.2 s display filter. 1 kg and 2 kg are still on hold.",
     "img": "assets/snapshots/lab_balance_fixture.jpg"
    },
    {
     "id": "lab_pick_place",
     "title": "Pick and place a 100 g weight",
     "tag": "Approved skill",
     "live": false,
     "status": "pass",
     "line": "Approved for release from 1.5 mm above a table (5 complete passes); support-before-release version written, not yet run",
     "details": "Approved for the isolated robot cell with the 100 g reference weight (50 N grip, smooth 1 s lift start). Five complete pick-lift-hold-place-release runs across two jobs: placement error 0.35–0.40 mm (limit 5 mm), slip while held 0.04–0.08 mm (limit 2 mm). The independent check compared 35,352 recorded values and 4.1 million contact pairs, with full agreement and zero violations. Two further attempts were cut off by a real-time limit and are counted as not observed. Not yet approved for the balance station."
    },
    {
     "id": "lab_motion_over_pan",
     "title": "Plan-driven motion over the balance pan",
     "tag": "Pilot station",
     "live": false,
     "status": "blocked",
     "line": "Refused by a safety check; fix ready, trial job about to be submitted",
     "details": "A balance button shifted slightly after the route was checked, so the run was refused. Moving parts may now shift up to 0.5 mm before a re-check; fixed parts must still match exactly."
    },
    {
     "id": "lab_balance_check",
     "title": "Experiment 12: 100 g balance routine check",
     "tag": "Full experiment",
     "live": false,
     "status": "running",
     "line": "Formal run request ready (37 calls); release-order fix passes CPU tests; trial job not submitted yet",
     "details": "Chosen as the first full native experiment. The formal request is compiled: 3 automated pre-checks, 25 robot and instrument calls and 9 calculation steps, with 307 evidence items to record. In the balance scene the 25 physical calls run with a diagnostic label until the skills are approved there, so a complete run does not yet count as an experiment pass. The trial job is fully prepared and goes in as soon as the execution agent is back online."
    },
    {
     "id": "lab_moisture",
     "title": "Experiment 13: moisture test",
     "tag": "Full experiment",
     "live": true,
     "status": "pending",
     "line": "Plan compiled (6 steps, 14 calls): 7 calls covered by approved skills, 7 need new skills (pan transfer, lid, instrument readout)",
     "details": "",
     "scene": "round28_experiment13",
     "img": "assets/snapshots/lab_moisture.jpg"
    },
    {
     "id": "lab_main",
     "title": "Main lab (pilot station in place)",
     "tag": "Complete lab",
     "live": true,
     "status": "pending",
     "line": "Room is stable; no robot run here yet",
     "details": "The main lab passed the 600-step stability test on 11-07. Robot work moves here after the fixture runs pass.",
     "img": "assets/snapshots/lab_main.jpg"
    }
   ]
  }
 ],
 "summary": [
  {
   "name": "Base scenes",
   "status": "partial",
   "line": "The 5 original scenes pass the strict stability test and are the reference standard. The 7 new rooms and the station scenes are drafts: too rough to accept, some without a ceiling. A five-gate acceptance (structure, appearance, stability, operable, task-ready) and a shared room kit are being set up"
  },
  {
   "name": "Auto-built scenes",
   "status": "partial",
   "line": "One command from paper to scene, robot placed automatically; 19 papers in; 5 scenes pass target-simulator library checks, 2 pilot scenes pass stability"
  },
  {
   "name": "Papers → orchestrated tasks",
   "status": "partial",
   "line": "Experiments 12 and 13 compiled and dry-run end to end; 11 task graphs, 130 task templates; skill gaps for the moisture pilot listed"
  },
  {
   "name": "Lab execution",
   "status": "partial",
   "line": "6 skills approved, pick-and-place included (placing releases 1.5 mm above the surface); trial job waits for final checks; no complete experiment has run yet"
  }
 ],
 "timeline": [
  {
   "t": "11-15 20:45",
   "text": "Owner review of the live session: apart from the five original scenes, the rooms are too rough and some have no ceiling. Acceptance now has five gates in order: structure complete, appearance (with owner sign-off), physics stability, operable, task-ready. All 18 scenes are being audited against the first gate, and a rebuild on a shared room kit is being planned."
  },
  {
   "t": "11-15 20:18",
   "text": "Auto-built scenes: all 5 pass the checks on the target simulator's CPU libraries. Next is the in-simulator run (materials, collision shapes, 600-step stability), queued for the idle diagnostic GPUs of the live session."
  },
  {
   "t": "11-15 20:12",
   "text": "New-room test cases finished: 12 of 21 ran to completion, 7 timed out, 2 crashed at the first step. Start-up contacts between overlapping collision shapes are confirmed in the simulator for one instrument; removing the overlap on one of its six heads cleared 3 of its 18 unstable parts. Latching the glovebox doors cleared that instrument. No room has passed yet. Snapshots of all 18 scenes refreshed."
  },
  {
   "t": "11-15 20:00",
   "text": "Disk space on the agents' machine fell below the stop line because of another project's data; three agents paused, then resumed under a narrower rule that still allows small control files. The trial job is not submitted yet."
  },
  {
   "t": "11-15 19:52",
   "text": "Balance-check release order fixed and tested on CPU: the weight is lowered in 0.1 mm steps until support is measured, and only then released. The same review showed the approved placing skill releases 1.5 mm above the surface and confirms support afterwards, so its approval is now stated with that limit."
  },
  {
   "t": "11-15 19:37",
   "text": "Live debug session is up: 18 scenes loaded, picture verified in a browser, open until 23:26. The 21 test cases for the new rooms run alongside it."
  },
  {
   "t": "11-15 19:23",
   "text": "Independent review caught an ordering defect in the balance-check code: the gripper opened before support under the weight was confirmed. It is being fixed before the trial job is submitted."
  },
  {
   "t": "11-15 19:19",
   "text": "Auto-built scenes: the new export passes 5 of 5 scenes on two CPU library versions; the run on the target simulator libraries is next."
  },
  {
   "t": "11-15 19:15",
   "text": "Lab execution was stopped before submitting by an identity check on its reference machine. Cause found: the machine is unchanged but its connection address moved. Corrected instructions sent; the trial job follows."
  },
  {
   "t": "11-15 19:09",
   "text": "Auto-built titration scene re-exported with both functional collision shapes: support check 116 pass, 9 warnings, 0 fail."
  },
  {
   "t": "11-15 17:48",
   "text": "Relay machine back after a restart. The base-scene agent is submitting the live debug session with its 21 test cases."
  },
  {
   "t": "11-15 17:06",
   "text": "Still waiting on the relay machine (unreachable since 03:16). All prepared jobs are ready to submit when it returns."
  },
  {
   "t": "11-15 08:32",
   "text": "New rooms: 40 of the 41 root parts start with overlapping collision shapes; for 7 the overlap depth matches the start-up jump to five digits."
  },
  {
   "t": "11-15 06:49",
   "text": "New rooms: most moving parts just follow a moving parent; about 40 root causes remain to be confirmed in the next run."
  },
  {
   "t": "11-15 06:05",
   "text": "New rooms: drive strength and targets ruled out as the cause for 177 of 179 moving parts; titrator collision shapes repaired from its own meshes."
  },
  {
   "t": "11-15 05:23",
   "text": "New rooms: all 242 unstable parts classified by evidence (74% have a position drive but still move); 19 test cases prepared for the next run."
  },
  {
   "t": "11-15 04:35",
   "text": "Formal request for the 100 g balance run is ready: 37 calls, rehearsed end to end with a simulated robot."
  },
  {
   "t": "11-15 04:13",
   "text": "Four of the five auto-built scenes pass the base-scene review; titration goes back for two missing collision shapes."
  },
  {
   "t": "11-15 03:30",
   "text": "Live-window connection rehearsal passes all three fault drills; the session itself is on hold because the relay machine stopped answering."
  },
  {
   "t": "11-15 03:15",
   "text": "Five auto-built scenes packaged for the live viewer (balance, moisture, titration, HPLC, meloxicam); stability runs queued."
  },
  {
   "t": "11-15 02:55",
   "text": "Pick-and-place approved for the isolated robot cell after an independent re-check of both runs."
  },
  {
   "t": "11-15 01:55",
   "text": "Disk space recovered; all four agents working again."
  },
  {
   "t": "11-14",
   "text": "Work paused for several hours for lack of disk space on the agents' workstation."
  },
  {
   "t": "11-12",
   "text": "Second pick-and-place run: 2 of 4 pass, the other two stopped by a real-time limit, not by physics."
  },
  {
   "t": "11-11",
   "text": "The 100 g balance routine check is chosen as the first full native experiment."
  },
  {
   "t": "11-08 22:47",
   "text": "First complete pick-and-place: 3 of 4 attempts pick, lift, hold, place and release the 100 g weight."
  },
  {
   "t": "11-08 19:30",
   "text": "All 5 original base scenes pass the strict 600-step stability test."
  },
  {
   "t": "11-08 15:20",
   "text": "Balance reading approved (100 g and 500 g)."
  },
  {
   "t": "11-08 12:04",
   "text": "Planned joint path approved as the second robot skill."
  },
  {
   "t": "11-08 06:24",
   "text": "Move to pose approved as the first robot skill."
  },
  {
   "t": "11-08 05:56",
   "text": "First stable balance reading: 100 g reads 99.99995 g."
  },
  {
   "t": "11-08 03:51",
   "text": "Live debug session: all 15 scenes opened and captured."
  },
  {
   "t": "11-07 04:27",
   "text": "Paper → protocol → scene runs as one command, with automatic robot placement."
  }
 ]
};
