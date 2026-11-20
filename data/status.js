window.STATUS = {
 "updated": "2026-11-20 21:30",
 "tz": "UTC+8",
 "snapshots_taken": "11-15 19:57",
 "session": {
  "online": false,
  "expires": null,
  "note": "No live session right now. The last one ran 19:37–23:26 on 11-15 with 18 scenes. The next session will carry the repaired rooms and the auto-built scenes, and its diagnostic GPUs will take test cases while it runs."
 },
 "default_port": 18621,
 "groups": [
  {
   "id": "base",
   "title": "Base scenes",
   "blurb": "Four original labs, the 36 m² weighing room and the corridor, plus 7 draft rooms still to be rebuilt. Across the finished rooms and the synthesis room: 226 loose objects that hold still and can be picked up, and 40 of the 124 moving parts planned for experiments confirmed in 3 full open-close cycles. Each shows its latest snapshot; with a live session it opens in Isaac Sim to play, pause, reset, move the camera and inspect instruments.",
   "items": [
    {
     "id": "legacy_l0",
     "title": "Intelligent chemistry robot platform",
     "tag": "Base",
     "live": false,
     "status": "pass",
     "line": "Passes the strict stability run on the platform (0 engine errors). 47 loose objects can be picked up; 8 of 27 planned moving parts confirmed (4 balance keys, all 3 draft-shield doors, the oven door).",
     "details": "Structure: 34 of 35 checks; the last item (glassware support) settled in the simulator. Lane lines checked on the plan view. A moving part counts as confirmed after 3 full open-close cycles that end and hold where they should and touch nothing outside the instrument (development machine; formal repeat to follow).",
     "img": "assets/snapshots/legacy_l0.jpg",
     "metrics": [
      {
       "label": "Objects that can be picked up",
       "value": 47
      },
      {
       "label": "Moving parts confirmed",
       "value": 6,
       "total": 27
      }
     ]
    },
    {
     "id": "legacy_l1",
     "title": "Organic synthesis lab",
     "tag": "Base",
     "live": false,
     "status": "pass",
     "line": "Passes the strict stability run on the platform (0 engine errors). 47 loose objects can be picked up; 8 of 18 planned moving parts confirmed (4 balance keys, all 3 draft-shield doors, the oven door).",
     "details": "Structure: 31 of 32 checks; the last item (glassware support) settled in the simulator. Lane lines checked on the plan view. A moving part counts as confirmed after 3 full open-close cycles that end and hold where they should and touch nothing outside the instrument (development machine; formal repeat to follow).",
     "img": "assets/snapshots/legacy_l1.jpg",
     "metrics": [
      {
       "label": "Objects that can be picked up",
       "value": 47
      },
      {
       "label": "Moving parts confirmed",
       "value": 6,
       "total": 18
      }
     ]
    },
    {
     "id": "legacy_l2",
     "title": "Analysis centre + weighing unit",
     "tag": "Base",
     "live": false,
     "status": "pass",
     "line": "Passes the strict stability run on the platform (0 engine errors). 32 loose objects can be picked up; 8 of 20 planned moving parts confirmed (4 balance keys, all 3 draft-shield doors, the moisture-analyser lid).",
     "details": "Structure: 34 of 35 checks; the last item (glassware support) settled in the simulator. Lane lines checked on the plan view. A moving part counts as confirmed after 3 full open-close cycles that end and hold where they should and touch nothing outside the instrument (development machine; formal repeat to follow).",
     "img": "assets/snapshots/legacy_l2.jpg",
     "metrics": [
      {
       "label": "Objects that can be picked up",
       "value": 32
      },
      {
       "label": "Moving parts confirmed",
       "value": 6,
       "total": 20
      }
     ]
    },
    {
     "id": "legacy_l3",
     "title": "Electrochemistry & energy materials lab",
     "tag": "Base",
     "live": false,
     "status": "pass",
     "line": "Passes the strict stability run on the platform (0 engine errors). 43 loose objects can be picked up; 9 of 26 planned moving parts confirmed (4 balance keys, all 3 draft-shield doors, the furnace door, the mill lid).",
     "details": "Structure: 32 of 33 checks; the last item (glassware support) settled in the simulator. Lane lines checked on the plan view. A moving part counts as confirmed after 3 full open-close cycles that end and hold where they should and touch nothing outside the instrument (development machine; formal repeat to follow).",
     "img": "assets/snapshots/legacy_l3.jpg",
     "metrics": [
      {
       "label": "Objects that can be picked up",
       "value": 43
      },
      {
       "label": "Moving parts confirmed",
       "value": 8,
       "total": 26
      }
     ]
    },
    {
     "id": "legacy_l4",
     "title": "FR3 100 mL weighing & recovery unit",
     "tag": "Base",
     "live": false,
     "status": "pass",
     "line": "Passes the strict 600-step stability test; weighing cell in an oversized room, compact shell planned",
     "details": "Two sample objects had been placed 7 mm above their support; with a 1 mm gap the room passes.",
     "img": "assets/snapshots/legacy_l4.jpg"
    },
    {
     "id": "room_double_island",
     "title": "Double-island wet-chemistry hall",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft room: floor mostly empty (under 9% used), two doorways without doors, no registered facilities; to be rebuilt on the room kit",
     "details": "By evidence: 42 are cable links held by constrained joints, 40 have a position drive but still move (2 of them, a micropipette button and dial, have a drive target that differs from the starting pose), 5 lack a restoring drive. Nearly all root parts start with overlapping collision shapes; fixes are prepared for the next run.",
     "img": "assets/snapshots/room_double_island.jpg"
    },
    {
     "id": "room_u_workcell",
     "title": "U-shaped bio / electrochemistry cell",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft room, to be rebuilt. Its main instrument is now fixed: all 18 unstable parts gone after removing the starting overlaps",
     "details": "About 40 root causes sit behind the moving parts in the new rooms. On the WTW OxiTop here, each of the six sensor heads starts with its collision shape 24.000 mm inside its sleeve, and each head jumps 24.0001 mm on the first step, a match to five digits. A collision-shape fix for one head and a latch are both prepared, with an untouched control, for the next run. Not yet confirmed in the simulator.",
     "img": "assets/snapshots/room_u_workcell.jpg"
    },
    {
     "id": "room_linear_flow",
     "title": "Continuous-flow corridor",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft room: floor mostly empty (under 9% used), two doorways without doors, no registered facilities; to be rebuilt on the room kit",
     "details": "A desorber lid starts 25.422 mm inside a neighbouring tube and jumps 25.422 mm on start-up. 6 other parts are robot gripper parts whose source model is not available locally.",
     "img": "assets/snapshots/room_linear_flow.jpg"
    },
    {
     "id": "room_l_suite",
     "title": "L-shaped digestion / separation suite",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft room: floor mostly empty (under 9% used), two doorways without doors, no registered facilities; to be rebuilt on the room kit",
     "details": "21 have a position drive but still move, 1 has a non-zero speed target, 1 lacks a restoring drive. Two valves turn to their 180° stop on the first step; a latch test with a control is prepared.",
     "img": "assets/snapshots/room_l_suite.jpg"
    },
    {
     "id": "room_spine_analysis",
     "title": "Six-bay analysis centre",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft room, to be rebuilt. The step-1 crash is traced to one instrument that crashes on its own",
     "details": "Two groups of 13 and 14 instruments each crash at step 1; 7 narrowing cases are prepared.",
     "img": "assets/snapshots/room_spine_analysis.jpg"
    },
    {
     "id": "room_racetrack",
     "title": "Ring logistics hall",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft room, to be rebuilt. The suspect instrument no longer crashes when split in four, but has about 130 unstable parts",
     "details": "Runs all 660 steps without the particle-size analyser. That instrument crashes as a whole but each half runs, so no single part is isolated yet; 7 narrowing cases are prepared.",
     "img": "assets/snapshots/room_racetrack.jpg"
    },
    {
     "id": "room_inert_suite",
     "title": "Inert multi-room suite",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft room: floor mostly empty (under 9% used), two doorways without doors, no registered facilities; to be rebuilt on the room kit",
     "details": "14 have a position drive but still move, 6 are robot gripper parts whose source model is not available locally, 2 lack a restoring drive. The two glovebox doors swing to their 90° stop on the first step; a latch test with a control is prepared.",
     "img": "assets/snapshots/room_inert_suite.jpg"
    },
    {
     "id": "station_centrifuge",
     "title": "Centrifuge station",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft station scene without a complete shell; to be merged into a rebuilt room",
     "details": "",
     "scene": "round28_centrifuge",
     "img": "assets/snapshots/station_centrifuge.jpg"
    },
    {
     "id": "station_oven",
     "title": "Oven station",
     "tag": "Draft",
     "live": false,
     "status": "fail",
     "line": "Draft station scene without a complete shell; to be merged into a rebuilt room",
     "details": "",
     "scene": "round28_oven",
     "img": "assets/snapshots/station_oven.jpg"
    },
    {
     "id": "rebuilt_balance",
     "title": "Weighing room, 36 m² (rebuilt)",
     "tag": "Rebuilt",
     "live": false,
     "status": "partial",
     "line": "Walls dressed on all four sides. Strict stability passes in the formal platform run (the spare 20 g weight was fixed: its 0.6 mm collider chamfer was thinner than the physics engine treats as a separate face). All 5 driven parts of the balance confirmed in the formal run (4 keys, transport lock). 8 loose objects (reference weights, forceps, brush). Waiting for appearance sign-off.",
     "details": "Formal run 20 Nov evening: strict 60 + 600 step stability PASS, 0 engine errors.",
     "img": "assets/snapshots/rebuilt_balance.jpg",
     "metrics": [
      {
       "label": "Objects that can be picked up",
       "value": 8
      },
      {
       "label": "Moving parts confirmed",
       "value": 5,
       "total": 7
      }
     ]
    },
    {
     "id": "rebuilt_balance_ne",
     "title": "Weighing room · opposite corner",
     "tag": "View",
     "live": false,
     "status": "partial",
     "line": "North-east corner: fixed robot arm on the island bench with the balance and weights; notice board, coat hooks and wall cabinets.",
     "details": "",
     "img": "assets/snapshots/rebuilt_balance_ne.jpg"
    },
    {
     "id": "rebuilt_balance_top",
     "title": "Weighing room · top view",
     "tag": "View",
     "live": false,
     "status": "partial",
     "line": "Plan view from above (ceiling hidden for the picture): island bench with the robot, wall benches and cabinets.",
     "details": "",
     "img": "assets/snapshots/rebuilt_balance_top.jpg"
    },
    {
     "id": "rebuilt_balance_pan",
     "title": "Weighing room · balance close-up",
     "tag": "View",
     "live": false,
     "status": "partial",
     "line": "Balance pan, display and keys with the gripper above. All four keys and the transport lock pass 3 full press-release cycles.",
     "details": "",
     "img": "assets/snapshots/rebuilt_balance_pan.jpg"
    },
    {
     "id": "rebuilt_moisture",
     "title": "Moisture and drying room (rebuilt)",
     "tag": "Rebuilt",
     "live": false,
     "status": "partial",
     "line": "With collisions filtered between rigidly fixed parts of the moisture analyser, all 23 structure checks pass on CPU; the simulator must still confirm no abnormal start-up contact. No picture yet",
     "details": ""
    },
    {
     "id": "rebuilt_thermal",
     "title": "Thermal workcell (rebuilt)",
     "tag": "Rebuilt",
     "live": false,
     "status": "partial",
     "line": "Structure gate and 600-step stability passed. Preview only: a too-dark render brightened for viewing, not an accepted image. Fit-out still bare compared with the original labs; lighting being recalibrated",
     "details": "",
     "img": "assets/snapshots/rebuilt_thermal.jpg"
    },
    {
     "id": "base_building",
     "title": "Five-room building, cut-away",
     "tag": "View",
     "live": false,
     "status": "partial",
     "line": "Render-only view with ceilings, roofs and ceiling light panels hidden: the four labs, the weighing room and the corridor between them.",
     "details": "",
     "img": "assets/snapshots/base_building.jpg"
    },
    {
     "id": "base_corridor",
     "title": "Corridor fit-out",
     "tag": "Fit-out",
     "live": false,
     "status": "partial",
     "line": "Skirting, handrails, floor lane lines, room plates, fire extinguishers and a notice board along the corridor. Static fit-out with no moving parts; waiting for appearance sign-off.",
     "details": "",
     "img": "assets/snapshots/base_corridor.jpg"
    }
   ]
  },
  {
   "id": "auto",
   "title": "Auto-built scenes",
   "blurb": "Scenes generated automatically from papers and protocols: one command goes from paper to protocol to scene, and the robot is placed automatically. Five are packaged for the live viewer.",
   "items": [
    {
     "id": "auto_alab_room",
     "title": "Phosphate synthesis room (built from the paper)",
     "tag": "Headline",
     "live": false,
     "status": "partial",
     "line": "Room for the headline experiment, shown in its first layout. Structure checks 33 of 33; 600-step stability run passed. Being re-laid out as a two-arm work cell; pictures and stability will be redone on the new layout. Robot operations fully bound: 0 of 6",
     "details": "",
     "img": "assets/snapshots/auto_alab_overview.jpg",
     "metrics": [
      {
       "label": "Objects that can be picked up",
       "value": 49
      },
      {
       "label": "Moving parts confirmed",
       "value": 2,
       "total": 26
      },
      {
       "label": "Robot operations bound (CPU)",
       "value": 6,
       "total": 6
      }
     ]
    },
    {
     "id": "auto_alab_furnace",
     "title": "Synthesis room · furnace",
     "tag": "View",
     "live": false,
     "status": "partial",
     "line": "Box furnace for the 1000 °C step. The door is now driven by the instrument (0 to 90°), refuses heating while open and pauses a run if opened; a part that blocked the swing now moves with the door. Travel under drive still to be confirmed in the simulator",
     "details": "",
     "img": "assets/snapshots/auto_alab_furnace.jpg"
    },
    {
     "id": "auto_alab_doser",
     "title": "Synthesis room · dosing balance",
     "tag": "View",
     "live": false,
     "status": "partial",
     "line": "Dosing station. A vial released onto the pan stays put (zero velocity after release). In the paper this station doses, mixes and dries by itself, so it is modelled as a station program",
     "details": "",
     "img": "assets/snapshots/auto_alab_doser.jpg"
    },
    {
     "id": "auto_balance_routine_check",
     "title": "Balance routine check (NIST IR 6969)",
     "tag": "From protocol",
     "live": false,
     "status": "pass",
     "line": "One command now builds it as the full weighing room: all 20 structure checks pass; bench version holds still for 600 simulator steps",
     "details": "Robot bench, robot, balance and reference weights, empty pan with pan lock. Passes the shared support rules (54 checks, 0 fail) and the 600-step stability test. The 100 g pilot package passes its 109 checks.",
     "img": "assets/snapshots/auto_balance_routine_check.jpg"
    },
    {
     "id": "auto_moisture",
     "title": "Moisture by loss on drying",
     "tag": "From protocol",
     "live": false,
     "status": "partial",
     "line": "Built as a full room by one command: all 23 structure checks pass on CPU after the rigid-part collision filter; simulator confirmation pending",
     "details": "Second pilot. One robot station reaches every pick and place point (0.61 rad joint margin). Sample-pan fixture built from the manual (90 mm pan)."
    },
    {
     "id": "auto_titration",
     "title": "Titration",
     "tag": "From paper",
     "live": false,
     "status": "partial",
     "line": "Built as a full room by one command: 22 of 23 structure checks pass; 2 overlaps remain (a piston in a part modelled without a bore), a real asset fault awaiting the asset owner",
     "details": "The titrator's stir bar and piston had no collision shape in the source model. A repair layer now adds one from each part's own visible mesh (convex hull), with nothing invented. The scene is being re-exported and still needs the simulator checks."
    },
    {
     "id": "auto_hplc",
     "title": "HPLC",
     "tag": "From paper",
     "live": false,
     "status": "partial",
     "line": "Holds still for the full 600 simulator steps; one clean-up step lacks a source; no room shell yet",
     "details": "Real instruments, robot and bench. Passes the support check (258 pass, 11 warnings). Waits for the 600-step stability run."
    },
    {
     "id": "auto_liang2021",
     "title": "liang2021",
     "tag": "From paper",
     "live": false,
     "status": "pending",
     "line": "Protocol passes the source check; export waits for one instrument asset; needs two rooms",
     "details": ""
    },
    {
     "id": "auto_meloxicam2022",
     "title": "meloxicam2022",
     "tag": "From paper",
     "live": false,
     "status": "partial",
     "line": "Protocol corrected (4 separate procedures); scene fails stability at step 1 on a lid hinge",
     "details": "Real instruments, robot and bench. Passes the support check (360 pass, 12 warnings). Waits for the 600-step stability run."
    },
    {
     "id": "auto_more",
     "title": "13 more source papers",
     "tag": "From paper",
     "live": false,
     "status": "partial",
     "line": "12 distinct scenes: 4 pass the 600-step stability run, 8 fail on one identified part each; 2 of 19 items still wait for instrument assets; no room shell yet",
     "details": "Every layout is checked against each instrument's real physics data (moving parts, collision shapes, joints). The pipeline now refuses to overwrite an earlier scene when its inputs change. About 300 native checks are still open."
    }
   ]
  },
  {
   "id": "papers",
   "title": "Papers, plans & tasks",
   "blurb": "From the paper to a synthesis plan, then to robot, instrument and observation calls. Plans are compiled; the independent review restarted on 11-20 at 21:44.",
   "items": [
    {
     "id": "plan_recipe118",
     "title": "Nature A-Lab CaFe₂P₂O₉ synthesis (recipe 118)",
     "tag": "Headline",
     "live": false,
     "status": "running",
     "line": "14 operations from the paper. The two-arm cell binds all 6 robot operations on CPU; the task plan is not compiled yet.",
     "details": "Solid-state synthesis with a box furnace step and a powder X-ray diffraction check. Powders and slurries are handled through instrument models and a mass ledger; results are labelled simulated and no product or yield is reported. The 14 operations are classified into robot actions, instrument programs and observations.",
     "metrics": [
      {
       "label": "Operations in the paper",
       "value": 14
      },
      {
       "label": "Robot operations bound (CPU)",
       "value": 6,
       "total": 6
      },
      {
       "label": "Robot sub-actions bound",
       "value": 21,
       "total": 21
      }
     ]
    },
    {
     "id": "plan_balance",
     "title": "Balance routine check (NIST IR 6969)",
     "tag": "Compiled",
     "live": false,
     "status": "partial",
     "line": "3 automated pre-checks, 25 robot and instrument calls and 9 calculations, with 307 evidence items to record.",
     "details": "First full experiment chosen for native execution; see Step 2 · Scripted task run for the run itself.",
     "metrics": [
      {
       "label": "Calls in the plan",
       "value": 37
      },
      {
       "label": "Calls confirmed",
       "value": 4,
       "total": 37
      },
      {
       "label": "Evidence items",
       "value": 307
      }
     ]
    },
    {
     "id": "plan_moisture",
     "title": "Moisture by loss on drying",
     "tag": "Compiled",
     "live": false,
     "status": "partial",
     "line": "21 steps per sample cycle, 63 for the paper's three measurements; none covered by an approved skill yet.",
     "details": "A checked path carries the sample carrier into the analyser with the lid open (tightest gap 5.2 mm).",
     "metrics": [
      {
       "label": "Steps per cycle",
       "value": 21
      },
      {
       "label": "Steps covered by approved skills",
       "value": 0,
       "total": 21
      }
     ]
    },
    {
     "id": "plan_titration",
     "title": "Titration",
     "tag": "Compiled",
     "live": false,
     "status": "partial",
     "line": "8 of 9 instrument links resolve; pH calibration still has no instrument or interface.",
     "details": "",
     "metrics": [
      {
       "label": "Instrument links resolved",
       "value": 8,
       "total": 9
      }
     ]
    },
    {
     "id": "plan_sources",
     "title": "Source papers",
     "tag": "Sources",
     "live": false,
     "status": "partial",
     "line": "19 source papers; 10 protocols fully traced to their source. Source gate: 83 of 130 nodes pass, 10 mixed, 37 undetermined.",
     "details": "",
     "metrics": [
      {
       "label": "Protocols fully sourced",
       "value": 10,
       "total": 19
      },
      {
       "label": "Source-gate nodes passing",
       "value": 83,
       "total": 130
      }
     ]
    },
    {
     "id": "plan_skill_queue",
     "title": "Skills the plans need",
     "tag": "Gaps",
     "live": false,
     "status": "partial",
     "line": "Across four plans: 82 calls, 12 with a ready skill and 70 gaps in 42 work units. Largest gaps: pick 8, closed-loop place 8, wait for stable 4, read balance 4.",
     "details": "",
     "metrics": [
      {
       "label": "Calls with a ready skill",
       "value": 12,
       "total": 82
      },
      {
       "label": "Work units to build",
       "value": 42
      }
     ]
    },
    {
     "id": "plan_review",
     "title": "Independent review",
     "tag": "Review",
     "live": false,
     "status": "running",
     "line": "Back since 21:44 after two days idle. Now reviewing the R53 run evidence (62 archives verified so far); next the descent path, the reading wrapper, the weighing-room binding and the recipe 118 task plan.",
     "details": "Dev attempts a7–a16 on the development machine, with their test-only switches, are not reviewed yet. Until a result is reviewed it remains the producer's own test evidence."
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
     "live": false,
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
     "status": "partial",
     "line": "Approved with the old motion timing. With the corrected timing: 2 complete passes independently confirmed; one more needed to extend the approval. Next run uses the corrected timing on both lanes",
     "details": "Approved for the isolated robot cell with the 100 g reference weight (50 N grip, smooth 1 s lift start). Five complete pick-lift-hold-place-release runs across two jobs: placement error 0.35–0.40 mm (limit 5 mm), slip while held 0.04–0.08 mm (limit 2 mm). The independent check compared 35,352 recorded values and 4.1 million contact pairs, with full agreement and zero violations. Two further attempts were cut off by a real-time limit and are counted as not observed. Not yet approved for the balance station."
    },
    {
     "id": "lab_motion_over_pan",
     "title": "Plan-driven motion over the balance pan",
     "tag": "Pilot station",
     "live": false,
     "status": "partial",
     "line": "Complete three-step runs with about 1 mm error and at least 38.9 mm clearance; obstacle test correctly refused. The last two runs were identical, so a run from a different starting pose is still needed, plus independent review",
     "details": "A balance button shifted slightly after the route was checked, so the run was refused. Moving parts may now shift up to 0.5 mm before a re-check; fixed parts must still match exactly."
    },
    {
     "id": "lab_balance_check",
     "title": "Experiment 12: 100 g balance routine check",
     "tag": "Full experiment",
     "live": false,
     "status": "partial",
     "line": "Steps 1–4 of 10 confirmed. Step 5 reaches the pre-grasp position, then is refused by an over-tight support-surface check (10 nanometres); check being corrected, next run without approval wait",
     "details": "Chosen as the first full native experiment. The formal request is compiled: 3 automated pre-checks, 25 robot and instrument calls and 9 calculation steps, with 307 evidence items to record. In the balance scene the 25 physical calls run with a diagnostic label until the skills are approved there, so a complete run does not yet count as an experiment pass. The trial job is fully prepared and goes in as soon as the execution agent is back online."
    },
    {
     "id": "lab_moisture",
     "title": "Experiment 13: moisture test",
     "tag": "Full experiment",
     "live": false,
     "status": "partial",
     "line": "Compiled into tasks: 21 steps per sample cycle (63 for the paper's three measurements); pilot room passes all structure checks on CPU; 0 of 21 steps covered by an approved skill yet",
     "details": "",
     "scene": "round28_experiment13",
     "img": "assets/snapshots/lab_moisture.jpg"
    },
    {
     "id": "lab_main",
     "title": "Main lab (pilot station in place)",
     "tag": "Complete lab",
     "live": false,
     "status": "pending",
     "line": "Room is stable; no robot run here yet",
     "details": "The main lab passed the 600-step stability test on 11-07. Robot work moves here after the fixture runs pass.",
     "img": "assets/snapshots/lab_main.jpg"
    },
    {
     "id": "lab_multiroom",
     "title": "Multi-room laboratory",
     "tag": "Goal",
     "live": false,
     "status": "partial",
     "line": "First simulator picture of the corrected five-room building: the corridor (lane lines, ceiling lights, one door opening). It is bare: no wall finish, door leaves or signs yet. Whole-building contact scan and strict stability run passed; the top view currently shows only roofs and will be re-rendered as a cut-away. First frame took 178 s to appear",
     "details": "Milestones: 1) floor spec and feasibility; 2) first building assembled, structure and appearance accepted; 3) whole building physically stable; 4) mobile robot can travel between all stations; 5) first cross-room experiment runs end to end.",
     "img": "assets/snapshots/lab_multiroom.jpg"
    }
   ]
  },
  {
   "id": "annot",
   "title": "Object annotation",
   "blurb": "Each of the 267 library assets gets size, pose, bottom and support geometry for clean placement, plus grasp regions, approach directions and hand offsets that steer grasp sampling.",
   "items": [
    {
     "id": "annot_library",
     "title": "Asset library",
     "tag": "267 assets",
     "live": false,
     "status": "partial",
     "line": "Source files match for all 267. Stable at rest: 232. Ready for scene building: 169. Ready for manipulation: 0.",
     "details": "",
     "metrics": [
      {
       "label": "Ready for scene building",
       "value": 169,
       "total": 267
      },
      {
       "label": "Stable at rest",
       "value": 232,
       "total": 267
      },
      {
       "label": "Ready for manipulation",
       "value": 0,
       "total": 267
      }
     ]
    },
    {
     "id": "annot_grasp_context",
     "title": "Grasp context for vessels",
     "tag": "Contract",
     "live": false,
     "status": "partial",
     "line": "18 vessel entries with pose class, free sides, arm reach, approach (side or from above) and allowed wall areas. Your three rules apply: upright and clear → from the right; lying → from above; crowded → from above.",
     "details": "",
     "metrics": [
      {
       "label": "Vessel entries",
       "value": 18
      },
      {
       "label": "Rule version",
       "value": "v005"
      }
     ]
    },
    {
     "id": "annot_mass",
     "title": "Masses from materials",
     "tag": "Masses",
     "live": false,
     "status": "running",
     "line": "208 assets had parts written as exactly 1 g. Masses are now estimated from materials, F3's vessels first: 4 of 6 done (the 100 mL beaker: 71.1 g of glass).",
     "details": "",
     "metrics": [
      {
       "label": "F3 vessels estimated",
       "value": 4,
       "total": 6
      },
      {
       "label": "Assets with placeholder masses",
       "value": 208
      }
     ]
    },
    {
     "id": "annot_ops",
     "title": "Operation proposals",
     "tag": "Proposals",
     "live": false,
     "status": "partial",
     "line": "770 operation proposals for 251 of 267 assets, drawn from 261 instrument manuals.",
     "details": "",
     "metrics": [
      {
       "label": "Assets with proposals",
       "value": 251,
       "total": 267
      }
     ]
    },
    {
     "id": "annot_orientation",
     "title": "Orientation decisions",
     "tag": "Needs you",
     "live": false,
     "status": "pending",
     "line": "70 assets need only an orientation decision to become ready for scene building.",
     "details": "",
     "metrics": [
      {
       "label": "Assets waiting",
       "value": 70
      }
     ]
    },
    {
     "id": "annot_job18",
     "title": "Simulator check · job 18",
     "tag": "Simulator",
     "live": false,
     "status": "running",
     "line": "4-card low-priority job queued. Four glass vessels re-run for 960 steps with estimated masses all pass on CPU.",
     "details": ""
    }
   ]
  },
  {
   "id": "grasp",
   "title": "Grasp sampling",
   "blurb": "Monte-Carlo sampling of right-hand poses guided by the annotations, then simplified to a stable hold. The finger layouts that would hold are known; no real hand pose reaches one yet.",
   "items": [
    {
     "id": "grasp_cylinder",
     "title": "500 mL graduated cylinder",
     "tag": "Vessel",
     "live": false,
     "status": "running",
     "line": "Best pose: 3 of 4 contacts pass. The middle finger lands 0.433 mm outside its allowed face; being re-solved now.",
     "details": "",
     "metrics": [
      {
       "label": "Contacts passing",
       "value": 3,
       "total": 4
      }
     ]
    },
    {
     "id": "grasp_beaker100",
     "title": "100 mL beaker",
     "tag": "Vessel",
     "live": false,
     "status": "blocked",
     "line": "The hand is taller than the beaker: at its table position only 2 poses clear the table. 24 mm from the edge, 73 clear and the best has 3 of 4 contacts.",
     "details": "",
     "metrics": [
      {
       "label": "Contacts passing (near edge)",
       "value": 3,
       "total": 4
      }
     ]
    },
    {
     "id": "grasp_layouts",
     "title": "Ideal finger layouts",
     "tag": "Loads",
     "live": false,
     "status": "pass",
     "line": "25 layouts hold all 63 test loads at no more than 9.5 N per finger; published to annotation.",
     "details": "",
     "metrics": [
      {
       "label": "Layouts holding all loads",
       "value": 25
      }
     ]
    },
    {
     "id": "grasp_library",
     "title": "Grasp library",
     "tag": "Library",
     "live": false,
     "status": "pending",
     "line": "0 entries. A grasp enters only after contacts, loads, perturbations and one physics run all pass.",
     "details": "",
     "metrics": [
      {
       "label": "Real hand poses passing all contacts",
       "value": 0,
       "total": 936
      }
     ]
    },
    {
     "id": "grasp_physics",
     "title": "Physics confirmation",
     "tag": "Physics",
     "live": false,
     "status": "pending",
     "line": "One CPU physics run is authorised (close, lift 30 mm, hold 0.5 s) for the first pose that passes every CPU gate.",
     "details": ""
    }
   ]
  },
  {
   "id": "atomic",
   "title": "Atomic tasks",
   "blurb": "Experiments split into atomic operations, collected and evaluated in small scenes carved from the big lab: objects the robot does not touch stay as shapes without collisions, so the view matches the big scene.",
   "items": [
    {
     "id": "atomic_decomp",
     "title": "Experiment decompositions",
     "tag": "Splits",
     "live": false,
     "status": "partial",
     "line": "Weigh-and-return (22 steps) plus three longer flows of 28, 30 and 61 steps; operation vocabulary v1 published.",
     "details": "",
     "metrics": [
      {
       "label": "Experiments decomposed",
       "value": 4
      },
      {
       "label": "Steps in the longest flow",
       "value": 61
      }
     ]
    },
    {
     "id": "atomic_episodes",
     "title": "Collected episodes",
     "tag": "Data",
     "live": false,
     "status": "partial",
     "line": "approach_pick 43 and descend_pick 40 episodes. grasp, lift, carry, place, release, retreat, return_home and retrieve: 0. weigh, verify and power_off: not reported.",
     "details": "",
     "metrics": [
      {
       "label": "approach_pick",
       "value": 43
      },
      {
       "label": "descend_pick",
       "value": 40
      },
      {
       "label": "Operations with data",
       "value": 2,
       "total": 13
      }
     ]
    },
    {
     "id": "atomic_carved",
     "title": "Carved small scenes",
     "tag": "Scenes",
     "live": false,
     "status": "running",
     "line": "Plan A approved: keep every object, switch off collisions on objects the robot does not touch. One carved scene built on CPU.",
     "details": "",
     "metrics": [
      {
       "label": "Carved scenes built",
       "value": 1
      }
     ]
    },
    {
     "id": "atomic_trial",
     "title": "GPU collection trial",
     "tag": "GPU trial",
     "live": false,
     "status": "partial",
     "line": "0 of 4 cases passed: all stopped at the pre-lift speed check. Cause: reported velocities don't match the measured positions while the gripper clamps. Your new measure is approved; the re-trial is being packaged.",
     "details": "",
     "metrics": [
      {
       "label": "Cases passed",
       "value": 0,
       "total": 4
      }
     ]
    }
   ]
  },
  {
   "id": "eval",
   "title": "Full-lab evaluation",
   "blurb": "An agent with mobile manipulation runs whole experiments in the full lab, so each policy is scored on the complete task, segment by segment.",
   "items": [
    {
     "id": "eval_pi05",
     "title": "π0.5 (zero-shot)",
     "tag": "Policy",
     "live": false,
     "status": "running",
     "line": "Six-start comparison job running on 4 low-priority cards (at most 8 card-hours and 150 model calls).",
     "details": ""
    },
    {
     "id": "eval_dp",
     "title": "Diffusion policy",
     "tag": "Policy",
     "live": false,
     "status": "partial",
     "line": "In-distribution chained tasks: approach 5/5 by the policy, place and weigh 5/5 by native skills, retrieve unmeasured. Out of distribution: 0/3.",
     "details": "This validates the pipeline, not generalisation.",
     "metrics": [
      {
       "label": "Approach by policy",
       "value": 5,
       "total": 5
      },
      {
       "label": "Out-of-distribution",
       "value": 0,
       "total": 3
      }
     ]
    },
    {
     "id": "eval_chain",
     "title": "Chain contract",
     "tag": "Framework",
     "live": false,
     "status": "pass",
     "line": "Experiment splits compile into chains the runner executes; the scoreboard keeps unmeasured separate from failed. 32 tests pass.",
     "details": ""
    },
    {
     "id": "eval_wam",
     "title": "World-action models",
     "tag": "Policy",
     "live": false,
     "status": "pending",
     "line": "Not connected yet; the download and any fine-tuning need your approval.",
     "details": ""
    },
    {
     "id": "eval_mobile",
     "title": "Agent + mobile manipulation",
     "tag": "Platform",
     "live": false,
     "status": "pending",
     "line": "Mobile base not chosen. A candidate agent profile lets the model control more than one segment of a chain.",
     "details": ""
    }
   ]
  }
 ],
 "summary": [
  {
   "name": "Headline · One complete paper experiment, every operation, in simulation",
   "status": "pending",
   "line": "Owner's stated priority. Chosen experiment: a published autonomous-lab solid-state synthesis of CaFe₂P₂O₉ with an X-ray diffraction check, 14 operations, 0 run so far. The synthesis room is now a two-arm work cell (fixed furnace arm, fixed characterisation arm, hand-off at the cooling tray) and all 6 robot operations, 21 of 21 robot sub-actions, are bound on CPU with structure checks 33 of 33. Open: many arm poses sit within 2° of a joint limit, too tight for execution, and simulator confirmation of the cell has not run yet. Gate: step 5 of the balance check, same robot skills"
  },
  {
   "name": "Goal A · First complete experiment by the robot",
   "status": "partial",
   "line": "100 g balance check: 4 of 37 steps confirmed. Step 5 on the development machine, attempt 10 (17:00): approach, descent and gripper closing all ran (to step 1815, fingers 12.4 mm apart), and the closing geometry check now passes with the 50-micrometre tolerance. It stopped on a second check of the same fact: the weight sinking a few micrometres into its own bench when the first finger touches. The same tolerance is being applied to that check only; all other limits unchanged. Grip force, lift and slip not measured yet. The simulation runs at about 0.3 to 0.5 s per step on the shared machine; logging the contact record once instead of twice will cut about a fifth of that. Test evidence only"
  },
  {
   "name": "Goal B · First accepted complete room",
   "status": "partial",
   "line": "36 m² weighing room: refitted (labelled boxes, logbooks, tools, spare weights, sockets, calibrated lights) and re-rendered; picture on this page. The strict stability run fails on one added item (a spare weight tilts 1.8° in the first step); a seat fix is built. Opposite walls still bare. Owner sign-off will be requested once the fix passes. Robot steps executed in this room: 0 of 37"
  },
  {
   "name": "Goal C · Second experiment, taken from a paper",
   "status": "pending",
   "line": "Moisture analysis: 63 steps planned for three samples, none run. New: a checked path for carrying the sample carrier into the analyser with the lid open (tightest gap 5.2 mm); with the lid closed the same path collides, so the robot must see the lid open first"
  },
  {
   "name": "Goal D · Multi-room laboratory with cross-room work",
   "status": "partial",
   "line": "Corrected five-room building: contact scan of 277 movable bodies and strict stability run passed; first pictures exist (corridor shown on this page, 178 s to first frame). The corridor is bare and the top view shows only roofs, so appearance work and a cut-away view are next. Doors static; no mobile-robot run yet"
  },
  {
   "name": "Goal E · From paper to runnable lab automatically",
   "status": "partial",
   "line": "Phosphate synthesis room rebuilt as a two-arm work cell by the automatic cell builder (fixtures placed on declared surfaces where the fixed arm reaches every access point): 6 of 6 robot operations and 21 of 21 sub-actions bound on CPU, structure checks 33 of 33. Simulator confirmation batch being prepared. Organic synthesis room 32 of 32, HPLC room 33 of 35, both on hold. None fully accepted (0 of 3)"
  },
  {
   "name": "Operability · moving parts of the instruments the planned experiments use",
   "status": "partial",
   "line": "Across the synthesis room, the four original labs and the weighing room: 124 mechanisms on the instruments the planned experiments need; 52 rigged. Confirmed moving in the simulator (development machine, three full cycles, no outside contact): the weighing-room balance keys and transport lock, the furnace door, the diffractometer door, and the balance keys in one original lab. A formal confirmation batch covering these and the other rigged mechanisms is being prepared. 449 mechanisms on instruments no planned experiment uses stay switched off"
  },
  {
   "name": "Base scenes",
   "status": "partial",
   "line": "Platform job of 02:19 succeeded: all four original labs pass the strict stability run. The weighing room's formal run failed on one added spare weight; the cause (the simulator merged a thin chamfer into the weight's base when simplifying its shape, leaving it lopsided) is fixed and passes on the development machine, formal re-run pending. Fully accepted base rooms: 0 of 5"
  },
  {
   "name": "Auto-built scenes",
   "status": "partial",
   "line": "One command builds three full rooms; the weighing room passes the structure gate, two fail on instrument-internal overlaps. Bench scenes: 4 of 12 pass the 600-step stability run. Protocols: 10 of 19 fully sourced"
  },
  {
   "name": "Papers → orchestrated tasks",
   "status": "partial",
   "line": "Independent review backlog unchanged: the evidence of the 11-17 run and the corrected descent path await review; the reviewing agent has not run since 11-17 and its account has not been switched yet"
  },
  {
   "name": "Lab execution",
   "status": "partial",
   "line": "6 skills approved; no new approvals. Native job submission had been paused since 11-18 by a rule (\"stop after two runs without progress\") that is now withdrawn: a run without progress must be followed by a named fault, a tested fix and added diagnostics, not by a stop"
  }
 ],
 "timeline": [
  {
   "t": "11-20 21:30",
   "text": "Base scenes: the weighing room passes strict stability in the formal platform run; the synthesis room passes on all 20 experiment snapshots, including the re-laid product cell, with 0 engine errors, and all 8 room views are rendered. 40 moving parts now confirmed across the rooms after fixing parts that were caught on their own instrument."
  },
  {
   "t": "11-20 17:00",
   "text": "Attempt 9 failed before any physics because the simulator could not reach its extension registry through the development machine's proxy; attempt 10 ran without the proxy."
  },
  {
   "t": "11-20 17:23",
   "text": "Balance check step 5, attempt 10: approach, descent and gripper closing ran to completion of the closing motion; the closing geometry check passed. Stopped on a second check of the same micrometre-scale contact between the weight and its bench; the 50-micrometre tolerance is extended to that check only."
  },
  {
   "t": "11-20 17:00",
   "text": "Base scenes: the weighing room passes strict stability after a collider fix on the spare 20 g weight; 33 moving parts confirmed across the rooms (balance keys, draft-shield side doors, furnace and diffractometer doors, mill lid), 226 loose objects ready to pick up; building cut-away cleaned up. Platform run for the updated synthesis room is being prepared."
  },
  {
   "t": "11-20 02:46",
   "text": "Base-scene platform job succeeded: the four original labs pass the strict stability run."
  },
  {
   "t": "11-20 06:30",
   "text": "Headline experiment: all 6 robot operations (21 sub-actions) bound to the two-arm work cell on CPU, using a new automatic cell builder that places fixtures where the fixed arm can reach them. Structure checks 33 of 33. Weakness found: many poses within 2° of a joint limit."
  },
  {
   "t": "11-20 17:05",
   "text": "Balance check step 5: attempt 8 stopped during the approach on a 10-minute per-phase time limit, because other projects held the shared machine at 90 % CPU and every simulator step took 2.4 times longer. Attempt 9 started with the development machine's time budgets scaled up; all physical, force and contact limits unchanged."
  },
  {
   "t": "11-20 02:19",
   "text": "Platform job submitted for the base scenes (17 cases): formal weighing-room run and pictures, building cut-away, the four original labs, furnace door open and closed. First operability count published: 36 of 89 needed mechanisms rigged, none confirmed in the simulator yet."
  },
  {
   "t": "11-20 01:55",
   "text": "Base scenes: four original labs rebuilt (structure checks 34/35, 31/32, 34/35, 32/33). Audit of moving parts: only the balance (buttons, draft-shield doors) is operable in those labs; other instruments are static models. Rigging of doors and lids starts with the instruments the planned experiments need."
  },
  {
   "t": "11-20 02:10",
   "text": "Correction: the two furnace operations are not yet fully bound. Their reach check relied on moving the robot base, which no skill can do. Checked against the paper: it uses two arms dedicated to stations (one on a rail serving four furnaces, one for characterisation). The synthesis room is being re-laid out with two fixed arms; fixtures already built carry over."
  },
  {
   "t": "11-20 01:45",
   "text": "Headline experiment: furnace loading and unloading are fully bound to the synthesis room on CPU (crucible tray, driven and interlocked furnace door, cooling rack, hand-off position). 2 of 6 robot operations, 8 of 21 sub-actions. Simulator confirmation handed over."
  },
  {
   "t": "11-20 01:20",
   "text": "Balance check step 5, attempt 7 on the development machine: approach and descent passed for the first time in the simulator. Stopped at gripper closing on a zero-tolerance geometry check (weight rim 2.5 micrometres below the bench plane after the first finger touched). Ruling: use the existing 50-micrometre surface tolerance in that check; all other limits unchanged. Also measured: the simulation runs about 66 times slower than real time, so the full 37 steps need a faster checking loop or a longer run."
  },
  {
   "t": "11-20 00:55",
   "text": "First pictures from the development machine: refitted weighing room, the phosphate synthesis room for the headline experiment (stable over 600 steps), and the building corridor. Findings: one added weight in the weighing room tilts 1.8° at the first step (fix built); the corridor is bare; the building's top view shows only roofs."
  },
  {
   "t": "11-19 23:25",
   "text": "Owner allowed OminiLab tests to share the development machine's GPUs with another project's light processes. Base-scene agent started rendering the refitted weighing room there."
  },
  {
   "t": "11-20 00:08",
   "text": "Headline experiment scoped against its source: the paper's methods and the authors' control code show six of the fourteen operations are done inside automated stations and six by robots. The room needs five more fixtures for the robot operations (movable crucible rack, furnace-door actuator, sieve and press fixtures, removable sample holder, labelled storage vial). Furnace door overlaps fixed on CPU."
  },
  {
   "t": "11-19 20:55",
   "text": "Owner approved native simulator tests on the development machine's two idle GPUs: one card for the balance-check chain, one for room pictures. Attempts that took hours through platform jobs now take minutes; platform jobs remain for the final reviewed runs."
  },
  {
   "t": "11-19 20:50",
   "text": "36 m² weighing room: 16 properly exposed simulator pictures and two 600-step stability runs delivered. Own verdict of the base-scene agent: workstation clear, room not yet at the original labs' level of realism."
  },
  {
   "t": "11-19 20:16",
   "text": "Phosphate synthesis room (where the headline experiment takes place): structure checks 33 of 33 after fixing a stirrer's support and adding lane markings. The experiment's 14 operations are mapped to the room; 13 need a physical workstation and none is fully bound yet."
  },
  {
   "t": "11-19 19:47",
   "text": "Two of the four agents (base scenes, auto-built scenes) were moved to a working AI account and resumed on the waiting instructions. The execution agent and the reviewing agent are still on the exhausted account."
  },
  {
   "t": "11-19 14:30",
   "text": "Status after a two-day gap in supervision. All four agents are currently stopped: the AI service account they run on reached its usage limit this morning (it resets on 11-25 unless topped up). The reference machine had also moved; the new one is verified. A rule that had frozen native runs since 11-18 is withdrawn. Instructions for the next run and for clearing the review backlog are delivered and waiting."
  },
  {
   "t": "11-19 07:26",
   "text": "Cause of the step-5 trouble found on CPU: the old descent path went 76 mm below the grasp height, with a finger intersecting the bench in a third of the samples. A corrected path stays at least 8 mm clear and passes continuous collision checks in both the fixture and the weighing room."
  },
  {
   "t": "11-18 21:18",
   "text": "Base-scene job finished: simulator views of the five original labs (15) and of the 36 m² weighing room (17)."
  },
  {
   "t": "11-17 20:37",
   "text": "Sixth run of the balance check stopped after 19 minutes. Steps 1 to 4 passed again; step 5 (pick up the weight) got as far as the approach. Two more pick-and-place passes in the isolated test scene completed. The platform reported no stop reason."
  },
  {
   "t": "11-17 02:09",
   "text": "Fifth run of the balance check is now a job on the platform, waiting for GPUs. Separately, the base-scene picture job from 00:31 turned out to be stuck inside the platform: its creation request has shown no progress for 100 minutes while a later request completed in 18. It will be resubmitted as a new job that also carries the corrected building."
  },
  {
   "t": "11-17 01:31",
   "text": "Correction to the multi-room draft: the building check reported the weighing room's weights 0.9 m above the floor. Cause: the bench was flagged to ignore parent transforms, so the assembler moved the room but left the bench behind. Assembler fixed, with a new check that static parts move with their room; the building is being rebuilt and re-verified. The earlier draft is kept unchanged and counts only as a diagnostic."
  },
  {
   "t": "11-17 01:36",
   "text": "Fifth run not yet submitted: every pre-submission check passed, then the submit tool stopped because a shared connection had closed with an earlier step. No job was created and no GPU time used; the tool is being fixed to refuse cleanly instead of falling back to another connection."
  },
  {
   "t": "11-17 00:31",
   "text": "Base-scene job submitted (four low-priority GPUs, batch only, 30 minutes at most): pictures of the weighing room and the first render and stability run of the draft multi-room building. Its queue runs on its own once the job starts. Separately, the moisture experiment was compiled into tasks: one sample cycle is 21 steps (8 by the robot, 7 by the instrument program, 6 checks and readings); the paper's three measurements are 63. None of the 21 is covered by an approved skill yet."
  },
  {
   "t": "11-17 00:03",
   "text": "Independent review of the fourth run so far: both pick-and-place passes with the corrected motion timing are confirmed complete (2 of the 3 needed); the two stops with the old timing were the holding-time limit, not physical failures; the obstacle test is confirmed as a correct refusal; balance-check steps 1–4 confirmed again. For the moisture experiment, the pilot room with the handled sample carrier passes all 23 structure checks on CPU in both resting positions, with at least 6.5 mm clearance to the lid over its whole travel."
  },
  {
   "t": "11-16 23:36",
   "text": "Titration room: the gantry-on-rails overlaps qualified under the refined rule, leaving 2 of the original 58 pairs. Those two are a piston inside a part that the source model draws as a solid cylinder with no bore, so they stay as a real asset fault and the titration room stays one check short. Work moves to the moisture experiment: a handling concept in which the robot places a handled sample carrier onto the analyser, with the lid and measurement run by the instrument program."
  },
  {
   "t": "11-16 23:18",
   "text": "Instrument-internal overlaps handled by filtering collisions only between parts that are rigidly fixed to each other: 46 of 58 overlapping pairs in three instruments qualified. The moisture room now passes all 23 structure checks on CPU; this stands only if the simulator shows no abnormal start-up contact. The titration room has 12 pairs left, all between a moving part and its guide (a gantry on its rails, a piston in its cylinder); the rule was refined to cover guides and those pairs are being re-judged."
  },
  {
   "t": "11-16 23:10",
   "text": "Multi-room lab: the first draft building has been assembled and loads on CPU. It joins the four original labs and the compact weighing room along a central 2.2 m corridor, with five door interfaces and one transport robot plus four fixed arms. It is a draft: doors are static, nothing has been rendered or run in the simulator, and it inherits 51 broken material links from the original lab files, so it fails the structure gate for now. Pictures of the building and a stability run are planned for the next batch job."
  },
  {
   "t": "11-16 22:42",
   "text": "First full round of \"one command to a room\": three room-shelled scenes built automatically (weighing, moisture, and a titration room whose two instruments were placed by the layout engine). All three pass the support check and the target-simulator library check. The weighing room passes all 20 structure checks, matching the room builder's own result. The other two fail one structure check: overlapping collision shapes inside three instruments. Repair candidates for those instruments are now being prepared."
  },
  {
   "t": "11-16 22:45",
   "text": "Rebuilt weighing room and thermal workcell: two diagnostic previews added to this page. They are the too-dark renders from this morning, brightened so the content can be seen; they are not accepted pictures. They show complete rooms (walls, tiled floor, bench, balance, robot, oven, extinguisher) that are still plain compared with the original labs: bare walls, one bench, one light. Fit-out to the level of the original labs and correct lighting are the next steps."
  },
  {
   "t": "11-16 22:31",
   "text": "Multi-room lab, first traversal check on the floor plan: the robot fits through every door with 11–27 cm to spare on each side and can turn in the corridor. Two robots passing side by side fit for the measured robot size but fall 7.6 cm short once a 10 cm safety margin per side is added. Paths inside the rooms cannot be judged yet because bench positions and docking marks are not exported. The weighing room's binding data has been handed to planning, which is now mapping the balance check onto that room."
  },
  {
   "t": "11-16 22:16",
   "text": "Fourth lab-execution run, full report (executor figures, review pending): pick-and-place with the corrected motion timing finished twice, placing within 0.27 and 0.30 mm and holding the weight for about 22.5 seconds in total, against the 60-second limit the old timing kept hitting. Motion over the pan: two runs with about 1 mm error and at least 38.9 mm clearance, but the two were identical, so they count as one independent observation. Balance check: stopped at step 5 because the support-surface check accepted only points within 10 nanometres of the highest one; the check is being corrected. Job used about 2 GPU-hours."
  },
  {
   "t": "11-16 22:15",
   "text": "First \"one command to a room\" result: the paper pipeline rebuilt the weighing room and the moisture room by calling the room builder directly, and every scene layer came out byte-identical to the published rooms. Placement spots for the titration instruments were found on two existing benches. Gate checks on these builds are running. In parallel, a 15-step transport-only task between two rooms was defined as the first cross-room target; it needs nine navigation, docking and carrying skills that do not exist yet."
  },
  {
   "t": "11-16 22:03",
   "text": "Auto-built scenes in the simulator, after the gripper fix: 4 of the 12 distinct scenes now hold still for the full 600 steps (balance check, HPLC, moisture analysis, titration). The other 8 each fail on one identified part at the first step: a sliding axis that jumps 25 mm (2 scenes), an oven door that swings 6.6° (2), an instrument foot (2), a lid hinge (1) and a sample lid (1)."
  },
  {
   "t": "11-16 21:54",
   "text": "Fourth lab-execution run finished (results as reported by the executor, independent review pending). Pick-and-place with the corrected motion timing completed twice from start to finish; with the old timing both attempts again stopped at the holding-time limit. Motion over the balance pan: two more complete three-step runs, and the obstacle test was correctly refused with no arm movement. Balance check: step 5 got past the earlier timing fault, opened the gripper and moved to the pre-grasp position, then was refused because the supporting surface under the weight was not observed; steps 6–10 did not run."
  },
  {
   "t": "11-16 21:50",
   "text": "Base-scene retest finished. The original-lab control picture came out clear through the same render path, so the render path works. The rebuilt rooms produced no picture: their first frame took 153–188 seconds, longer than the 120-second wait; the wait is fixed and needs one more run. The moisture room fails its start-up contact check (a large persistent impulse inside the moisture analyser), so it stays sent back. Auto-built scenes no longer share the gripper fault; eight still fail on individual instruments (oven door, a sliding mechanism, instrument feet, sample covers)."
  },
  {
   "t": "11-16 21:39",
   "text": "Protocol steps sorted into three kinds for all 19 items: from the paper, from a standard, and project handling steps. Result: 10 protocols are fully sourced (one of them, the balance check, with project handling steps), 7 have real gaps where the paper leaves out something that affects the measurement (for example sample mass), and 2 only lack an instrument cleaning procedure. For the moisture experiment the missing pieces are being looked up in the instrument maker's operating instructions."
  },
  {
   "t": "11-16 21:35",
   "text": "Work re-anchored on five milestones toward the overall goal (see Summary). Agents may now submit a limited number of simulator jobs per day once their own checks pass, instead of waiting for each approval; assembly of the multi-room building starts as a draft; work not on a milestone path is time-boxed."
  },
  {
   "t": "11-16 21:18",
   "text": "Protocols re-extracted: structured open-access originals were obtained for all four papers that only had a web-page copy. Three flawed protocols were split into single procedures (four, two and four). Counting the corrected versions, 10 of 19 now pass the source check and 9 remain open. Those 9 are open because they contain steps no paper describes (loading the sample, cleaning, shutting down); such steps now form their own category that needs an instrument manual or project rule as its source and may never change what is measured."
  },
  {
   "t": "11-16 21:12",
   "text": "Task planning now carries the protocol audit: of 130 task steps, 83 trace to a verified source, 10 belong to a protocol that merged procedures, 37 are unjudged. Counting whole experiments, 87 of 130 steps are held back; only the three fully verified experiments (43 steps) clear this check. No cross-room experiment can be dispatched yet. A written limit now states what a completed balance check may and may not be claimed to show."
  },
  {
   "t": "11-16 20:55",
   "text": "Fourth lab-execution run submitted and running; its first stage (240 measured simulator steps) completed. The base-scene retest passed its start-up checks and platform admission and is about to be submitted."
  },
  {
   "t": "11-16 20:55",
   "text": "Protocol audit of all 19 pipeline items with the two new checks: 3 pass (the balance check, titration and one milling paper), 3 took steps from outside the paper's own methods, 2 merged separate procedures, and 11 cannot be judged yet, mostly because only a web-page copy of the paper is available. The first cross-room candidate was one of the merged ones and is withdrawn. Structured originals are now being fetched and the affected protocols re-extracted."
  },
  {
   "t": "11-16 20:26",
   "text": "Auto-built scenes: 9 room requests delivered in the room builder's format (1 weighing, 2 moisture, 6 thermal). While preparing them, two extracted protocols were found to be wrong: one took its method from another group's work described in the paper's introduction, the other merged a main procedure with a reference branch. Both are on hold. Extraction now gets two extra checks (the step must come from the paper's own methods section, and all steps must belong to one procedure), and all 19 items are being re-audited, starting with the experiments already compiled into tasks."
  },
  {
   "t": "11-16 20:12",
   "text": "Base scenes: cause of the dark room pictures narrowed down. The rebuilt rooms' lights carry roughly one ninth of the light per square metre of the original labs. The retest renders both settings from the same camera, with an original lab as control."
  },
  {
   "t": "11-16 20:05",
   "text": "Approved: a fourth lab-execution run (balance check with the corrected motion timing, two more motion-over-pan runs plus an obstacle test, pick-and-place with old and new timing side by side) and a short base-scene retest that first proves rendering works and then, in the same job, takes the full set of room views."
  },
  {
   "t": "11-16 16:03",
   "text": "Lab execution: the corrected motion timing turns the refused pick-up path into a 6.97-second motion within all limits, confirmed on CPU by the executor and independently by the reviewer. Cause of the holding-time stop found: the old timing made lifts take 35–40 seconds, leaving almost no margin under the 60-second limit."
  },
  {
   "t": "11-16 15:16",
   "text": "Auto-built scenes: the common cause of the simulator failures was found and fixed on CPU: gripper finger joints had no starting state. Re-test queued."
  },
  {
   "t": "11-16 07:24",
   "text": "Base-scene batch job finished (43 cases, four GPU lanes 71–77% busy). All three rebuilt rooms held still for the full 600 steps. The weighing and thermal rooms still pass the structure gate; the moisture room was sent back because the moisture analyser has 15 internal overlaps. Room pictures failed: only 5 of 172 images were produced, two far too dark and one black, so there is still no picture to show. One instrument fix removed all 18 unstable parts; a single instrument was identified as the cause of the crashing room. All 12 auto-built scenes failed the stability run."
  },
  {
   "t": "11-16 05:37",
   "text": "Independent review of the third run: 6 of 18 criteria confirmed (up from 2), no physical failure, 12 not yet observable. Confirmed: the 2.5× timing, the first three balance-check steps, the raw taring readings, and that both pick-and-place stops were time and log limits, not physical failures. Not confirmed: motion over the pan, only because the reviewer could not read the raw files; they are being exported to it. Approval rule set for motion over the pan: three independent complete runs plus one obstacle test, each independently reviewed."
  },
  {
   "t": "11-16 04:56",
   "text": "Third lab-execution run gave the first substantial simulator results (all still to be confirmed by independent review). Motion over the balance pan: all three steps completed, about 1 mm position error, at least 39 mm clearance, no unexpected contact. Both pick-and-place trials lifted and held the weight with 0.04–0.06 mm slip; one then hit a 60-second holding limit before placing, the other placed within 0.35 mm and then hit a log-size limit while retreating. Balance check: steps 1–4 reported passed, this time with raw force and mass readings; step 5 (pick up the weight) was refused again because motion timing stretched a 6.9-second path to 33.7 seconds. Recording overhead fell from 7.2 to 2.5 times real time."
  },
  {
   "t": "11-16 01:52",
   "text": "Correction after independent review of the retry job: the first 4 balance-check steps were reported as passed by the executing system, but the reviewer could not confirm them, because the raw force readings, taring session and mass read-back were not included in the evidence it received. Of its 18 criteria, 2 are confirmed, 0 are physical failures and 16 are not observable yet. Also corrected: the gripper open-and-close warm-up did run on the pick-and-place workers; the trials after it were refused before any command. Raw evidence for the reviewer is now required from every run."
  },
  {
   "t": "11-16 01:50",
   "text": "First three rebuilt rooms pass the structure gate on every item: a weighing room (17 m²), a moisture and drying room (34 m²) and a thermal workcell (17 m²), each with full walls, roof, door, light fixtures on hangers, exit sign, extinguisher and waste station. They have not been rendered or run in the simulator yet, so appearance, stability and operation are still open."
  },
  {
   "t": "11-16 01:50",
   "text": "The four original labs do not pass the structure gate yet, with geometry untouched: floor use, benches, fixture counts, hoods, sinks, eyewash and extinguishers pass; missing are a waste station, legible exit signs (the boards are blank), lane markings in three of them, and a few unresolved support checks. Repairs approved as add-on layers. Floor plan for the multi-room lab finalised on paper: two rows of rooms, a 2.2 m corridor, automatic sliding doors."
  },
  {
   "t": "11-16 01:34",
   "text": "Auto-built scenes: with the newly published instrument assets, 17 of the 19 pipeline items now pass the target-simulator library checks (12 distinct scenes, since several papers share one). The remaining 2 wait for an X-ray diffractometer cooling unit and for a verified DSC model. All 19 are still benches without a room, so all fail the structure gate."
  },
  {
   "t": "11-16 01:33",
   "text": "Lab-execution retry ran and gave the first simulator data for the balance check: the first 4 of 10 steps passed (three automatic pre-checks and taring). Step 5, picking up the weight, stopped in motion timing before the arm moved. Motion over the pan was refused by a check that was set tighter than numerical noise. Both pick-and-place workers stopped on a software regression before issuing any command. One worker failing no longer stops the others. No skill gained or lost approval."
  },
  {
   "t": "11-16 01:33",
   "text": "Timing measured for the first time: recording each simulator step costs about ten times the physics itself (serialising records is 54% of the time, saving to disk under 1%). The recording format will be made compact."
  },
  {
   "t": "11-16 01:25",
   "text": "Structure gate calibrated on the four original labs: floor use, bench use, light fixtures, fume hoods and sinks meet the rules once registered; waste stations, legible exit signs, some lane markings and support evidence are still missing, so they do not pass on declarations alone."
  },
  {
   "t": "11-15 23:41",
   "text": "Structure gate defined with measurable rules, calibrated against the four original labs: closed shell with door leaves, a reviewed list of facilities per room type, floor use between 15% and 40% (the original labs measure 24–30%, the new rooms 3.6–8.2%), one visible light fixture per 10 square metres, every object supported. Rebuild approved for the shared room kit and the first three scenes; next GPU job will be batch-only."
  },
  {
   "t": "11-15 23:26",
   "text": "Live debug session ended on schedule (19:37–23:26). Results: 21 test cases, 18 scene snapshots, and the owner review that led to the new acceptance gates."
  },
  {
   "t": "11-15 23:21",
   "text": "All 18 scenes audited for structure: some station scenes have no complete shell, and the seven rooms still lack proper doorways, facilities, light fixtures and use of space. Joining the five original rooms with a corridor is feasible with conditions (door mechanisms and robot definitions must be unified first)."
  },
  {
   "t": "11-15 23:21",
   "text": "Lab execution: retry preparation. One worker's bookkeeping error no longer stops the other three (shown in a four-process test); 39 kinds of operation classified into auxiliary, infrastructure and safety. An independent review agrees the failed job stopped before anything physical ran."
  },
  {
   "t": "11-15 22:07",
   "text": "Lab-execution trial job failed on a software fault in its own coordinator (a file scan collided with a folder being deleted), after the platform took 51 minutes to create it. No physical result; nothing can be concluded about the balance check or pick-and-place. A fix, a test for it and a CPU dress rehearsal are required before a retry."
  },
  {
   "t": "11-15 22:01",
   "text": "The running session cannot accept more test cases once started, so the second batch (the room fixes, the 8 auto-built scenes, crash narrowing) moves to the next job. Accepting extra cases at run time becomes a required feature before the next session."
  },
  {
   "t": "11-15 21:55",
   "text": "Base scenes: construction-and-acceptance checks are now in code. Seven separate checks (building, layout, appearance, physics, instrument function, robot service, utilities); any failure or missing evidence blocks acceptance. The seven rooms have repair candidates with roof, lights and materials; they are not in the live viewer yet."
  },
  {
   "t": "11-15 21:47",
   "text": "Auto-built scenes: room requirements derived from the 8 protocols. Of 297 individual requirements, 61 are stated in the source text and 212 are not stated by the papers at all (bench length, ventilation, waste, transfer limits), so they need project-defined defaults. Request formats for a room and for a floor drafted; three experiments have a two-zone floor draft."
  },
  {
   "t": "11-15 21:45",
   "text": "Base scenes: the seven draft rooms now pass the building part of the structure check (ceiling, visible lights, wall and floor materials) on the simulator libraries; rendering, physics and instrument checks are still open, so they remain drafts."
  },
  {
   "t": "11-15 21:42",
   "text": "Task planning: the location model is now a runnable pre-check over all 11 task graphs and 130 templates; it lists, per owner, what is missing before a cross-room task can be dispatched (floor plan, sample hand-over declarations, skills)."
  },
  {
   "t": "11-15 21:21",
   "text": "Auto-built scenes: all 19 pipeline items were run on the reference machine. 8 now pass the target-simulator library checks (3 new: marinade titration, buckwheat phenols, shrimp moisture); the other 11 wait for instrument assets that are not yet published. None has a room shell yet, so none passes the new structure gate."
  },
  {
   "t": "11-15 21:10",
   "text": "Lab-execution trial job submitted (one request, 4 GPUs, low priority) after all pre-checks passed, including 1,503 tests on the target simulator libraries. It runs the timing check, motion over the balance pan, pick-and-place, and the first 10 steps of the 100 g balance check with the corrected release order."
  },
  {
   "t": "11-15 21:15",
   "text": "Cross-room planning design drafted: a location model (floor, room, station, dock), 13 new step types for moving, docking, doors, carrying and hand-over. Of the 11 compiled experiments, 3 need two rooms. Waiting for the floor plan spec."
  },
  {
   "t": "11-15 21:12",
   "text": "Base scenes: the room generator now adds ceilings, visible light fixtures and complete wall and floor materials, with a check that fails if a roof, wall or light is missing."
  },
  {
   "t": "11-15 20:52",
   "text": "New project goal: a large multi-room laboratory where the robot runs experiments across rooms. Scene specs become two-level (rooms, then a floor plan with corridors and doors); the first version is proposed as the five original rooms joined by a corridor, feasibility under review."
  },
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
 ],
 "pipeline": {
  "updated": "2026-11-20 21:50",
  "goal": "A robot runs a published experiment from start to finish in a simulated lab, every operation reviewed, and policies are judged on whole experiments. Current headline: the Nature A-Lab CaFe₂P₂O₉ synthesis with powder XRD (recipe 118).",
  "flow": [
   {
    "label": "Real papers",
    "sub": "19 sources",
    "status": "partial"
   },
   {
    "label": "Protocol & tasks",
    "sub": "review restarted 21:44",
    "status": "running"
   },
   {
    "label": "Assets & scenes",
    "sub": "5 labs stable, auto builder",
    "status": "running"
   },
   {
    "label": "Grasps from annotations",
    "sub": "0 grasps proven yet",
    "status": "running"
   },
   {
    "label": "Atomic data & training",
    "sub": "2 of 13 operations collected",
    "status": "running"
   },
   {
    "label": "Full-experiment evaluation",
    "sub": "π0.5 job running",
    "status": "running"
   }
  ],
  "mentors": [
   {
    "name": "HQ mentor",
    "covers": "All steps",
    "note": "Reviews at stage boundaries"
   },
   {
    "name": "Coordinator",
    "covers": "Steps 1–2",
    "note": "“OminiLab” conversation"
   },
   {
    "name": "Manipulation mentor",
    "covers": "Step 3",
    "note": "“Ominilab_手势” conversation"
   }
  ],
  "steps": [
   {
    "id": "step1",
    "n": 1,
    "title": "Scenes",
    "what": "Realistic, varied base labs, merged into a multi-lab building, plus a builder that makes operable scenes from papers.",
    "mentor": "Coordinator",
    "groups": [
     "base",
     "auto"
    ]
   },
   {
    "id": "step2",
    "n": 2,
    "title": "Papers → plans → tasks",
    "what": "Synthesis plan from the paper, instruments placed into a base scene, then the plan compiled into robot tasks.",
    "mentor": "Coordinator",
    "groups": [
     "papers",
     "lab"
    ]
   },
   {
    "id": "step3",
    "n": 3,
    "title": "Manipulation",
    "what": "Annotate objects, sample stable grasps, collect atomic tasks in carved small scenes, and evaluate policies on full experiments.",
    "mentor": "Manipulation mentor",
    "groups": [
     "annot",
     "grasp",
     "atomic",
     "eval"
    ]
   }
  ],
  "stages": [
   {
    "id": "s1_builder",
    "step": "step1",
    "col": 1,
    "row": 1,
    "group": "auto",
    "title": "Auto scene builder",
    "what": "Builds operable scenes from papers and our assets; checks collisions, overlaps and reach.",
    "agent": "Scene-builder agent",
    "agent_state": "running",
    "status": "running",
    "progress": {
     "label": "Bench scenes stable over 600 steps",
     "value": 4,
     "total": 12
    },
    "metrics": [
     {
      "label": "Full rooms from one command",
      "value": 3
     },
     {
      "label": "Automatic inspection gates",
      "value": "G1–G7"
     },
     {
      "label": "Joint-limit margin rule",
      "value": "≥ 5°"
     }
    ],
    "next": "Publish release f of the two-arm cell with every gate passing."
   },
   {
    "id": "s1_base",
    "step": "step1",
    "col": 1,
    "row": 2,
    "group": "base",
    "title": "Base scenes",
    "what": "About ten realistic labs (chemistry, materials, biology…) with different layouts.",
    "agent": "Base-scene agent",
    "agent_state": "running",
    "status": "partial",
    "progress": {
     "label": "Labs passing the strict stability run",
     "value": 5,
     "total": 10
    },
    "metrics": [
     {
      "label": "Objects that can be picked up",
      "value": 226
     },
     {
      "label": "Moving parts confirmed",
      "value": 33,
      "total": 124
     },
     {
      "label": "Accepted by you",
      "value": 0,
      "total": 5
     }
    ],
    "next": "Rerun the 7 remaining cell states at 20:19; fix 3 stuck mechanisms; rebuild the 7 draft rooms (biology is only in drafts)."
   },
   {
    "id": "s1_multilab",
    "step": "step1",
    "col": 1,
    "row": 4,
    "group": "lab",
    "item": "lab_multiroom",
    "title": "Multi-lab building",
    "what": "Several base labs merged into one building so experiments can cross rooms.",
    "agent": "Base-scene agent",
    "agent_state": "idle",
    "status": "partial",
    "progress": {
     "label": "Building milestones",
     "value": 2,
     "total": 5
    },
    "metrics": [
     {
      "label": "Movable bodies scanned, stable",
      "value": 277
     },
     {
      "label": "Mobile-robot runs",
      "value": 0
     }
    ],
    "next": "Wall finish, doors and signs; then a mobile robot travelling between stations."
   },
   {
    "id": "s2_plan",
    "step": "step2",
    "col": 2,
    "row": 1,
    "group": "papers",
    "item": "plan_sources",
    "title": "Paper → synthesis plan",
    "what": "Extract the protocol from the paper and trace every step to its source.",
    "agent": "Scene-builder agent",
    "agent_state": "running",
    "status": "partial",
    "progress": {
     "label": "Protocols fully sourced",
     "value": 10,
     "total": 19
    },
    "metrics": [
     {
      "label": "Headline experiment operations",
      "value": 14
     },
     {
      "label": "Source-gate nodes passing",
      "value": 83,
      "total": 130
     }
    ],
    "next": "Finish sourcing; extend beyond recipe 118 once it runs."
   },
   {
    "id": "s2_scene",
    "step": "step2",
    "col": 2,
    "row": 2,
    "group": "auto",
    "item": "auto_alab_room",
    "title": "Instruments → scene",
    "what": "Pick the instruments we have, place them in a base scene, let the builder fix the layout.",
    "agent": "Scene-builder agent",
    "agent_state": "running",
    "status": "running",
    "progress": {
     "label": "Recipe 118 robot operations bound (CPU)",
     "value": 6,
     "total": 6
    },
    "metrics": [
     {
      "label": "Robot sub-actions bound",
      "value": 21,
      "total": 21
     },
     {
      "label": "Cell states stable in the simulator",
      "value": 11,
      "total": 18
     },
     {
      "label": "Doors and balance confirmed",
      "value": "yes"
     }
    ],
    "next": "Release f (≥ 5° from joint limits) → simulator check by the base-scene agent."
   },
   {
    "id": "s2_tasks",
    "step": "step2",
    "col": 2,
    "row": 3,
    "group": "papers",
    "item": "plan_skill_queue",
    "title": "Orchestrated tasks",
    "what": "Compile the plan into robot, instrument and observation calls; review results independently.",
    "agent": "Orchestration & review agent",
    "agent_state": "running",
    "status": "running",
    "progress": {
     "label": "Task calls covered by a ready skill",
     "value": 12,
     "total": 82
    },
    "metrics": [
     {
      "label": "Balance check calls",
      "value": 37
     },
     {
      "label": "Recipe 118 task plan",
      "value": "not compiled"
     },
     {
      "label": "Reviews since 11-17",
      "value": "R53 under way"
     }
    ],
    "next": "Back since 21:44: reviewing the R53 run evidence, then the descent path, then the recipe 118 task plan."
   },
   {
    "id": "s2_run",
    "step": "step2",
    "col": 2,
    "row": 4,
    "group": "lab",
    "item": "lab_balance_check",
    "title": "Scripted task run",
    "what": "Run the compiled tasks with native robot skills to prove the experiment is executable.",
    "agent": "Task-execution agent",
    "agent_state": "running",
    "status": "running",
    "progress": {
     "label": "Balance check calls confirmed",
     "value": 4,
     "total": 37
    },
    "metrics": [
     {
      "label": "Latest attempt",
      "value": "a16 running"
     },
     {
      "label": "a14 grip at stop",
      "value": "27 N < 30 N"
     },
     {
      "label": "Approved skills",
      "value": 6
     }
    ],
    "next": "a16 runs the original protocol with the new grip window; goal: hold the 100 g weight through the lift."
   },
   {
    "id": "s3_annot",
    "step": "step3",
    "col": 3,
    "row": 1,
    "group": "annot",
    "title": "Object annotation",
    "what": "Size, pose and bottom for clean placement; grasp poses and offsets for sampling.",
    "agent": "Annotation agent",
    "agent_state": "running",
    "status": "running",
    "progress": {
     "label": "Assets ready for scene building",
     "value": 169,
     "total": 267
    },
    "metrics": [
     {
      "label": "Stable at rest",
      "value": 232,
      "total": 267
     },
     {
      "label": "Ready for manipulation",
      "value": 0,
      "total": 267
     },
     {
      "label": "Operation proposals",
      "value": 770
     }
    ],
    "next": "Simulator job 18; masses from materials (208 assets had 1 g placeholders)."
   },
   {
    "id": "s3_grasp",
    "step": "step3",
    "col": 3,
    "row": 2,
    "group": "grasp",
    "title": "Grasp sampling & stabilising",
    "what": "Monte-Carlo hand poses guided by the annotations, then simplified to a stable hold.",
    "agent": "Grasp-sampling agent",
    "agent_state": "running",
    "status": "running",
    "progress": {
     "label": "Grasps in the library",
     "value": 0
    },
    "metrics": [
     {
      "label": "Ideal finger layouts that hold all loads",
      "value": 25
     },
     {
      "label": "Real hand poses passing all contacts",
      "value": 0,
      "total": 936
     },
     {
      "label": "Best so far",
      "value": "cylinder, 3 of 4 fingers"
     }
    ],
    "next": "First closed-loop demo on the 500 mL cylinder: one physics run with video."
   },
   {
    "id": "s3_atomic",
    "step": "step3",
    "col": 3,
    "row": 3,
    "group": "atomic",
    "title": "Atomic tasks in carved scenes",
    "what": "Split experiments into atomic tasks; collect them in small scenes cut from the big lab.",
    "agent": "Atomic-task agent",
    "agent_state": "running",
    "status": "running",
    "progress": {
     "label": "Atomic operations with collected episodes",
     "value": 2,
     "total": 13
    },
    "metrics": [
     {
      "label": "Episodes: approach / descend",
      "value": "43 / 40"
     },
     {
      "label": "Experiments decomposed",
      "value": 4
     },
     {
      "label": "Carved scenes built (CPU)",
      "value": 1
     }
    ],
    "next": "New grip-speed measure into the real check, then a GPU re-trial of the lift."
   },
   {
    "id": "s3_eval",
    "step": "step3",
    "col": 3,
    "row": 4,
    "group": "eval",
    "title": "Full-lab evaluation",
    "what": "An agent with mobile manipulation runs whole experiments so policies are judged end to end.",
    "agent": "Evaluation agent",
    "agent_state": "running",
    "status": "running",
    "progress": {
     "label": "Policies with chain results",
     "value": 1,
     "total": 3
    },
    "metrics": [
     {
      "label": "π0.5 six-start job",
      "value": "running"
     },
     {
      "label": "DP, approach in chain",
      "value": "5 / 5"
     },
     {
      "label": "Mobile base",
      "value": "not chosen"
     }
    ],
    "next": "Read back the π0.5 job; stream evidence to disk so the last stage can be scored."
   }
  ],
  "links": [
   {
    "from": "s3_annot",
    "to": "s1_builder",
    "label": "size · pose · bottom",
    "route": "top",
    "kind": "feed"
   },
   {
    "from": "s1_base",
    "to": "s1_multilab",
    "label": "rooms merged",
    "route": "down",
    "kind": "flow"
   },
   {
    "from": "s1_builder",
    "to": "s2_scene",
    "label": "layout fixes",
    "route": "gutter",
    "kind": "flow",
    "lane": -1
   },
   {
    "from": "s1_base",
    "to": "s2_scene",
    "label": "base lab",
    "route": "right",
    "kind": "flow",
    "lane": 1
   },
   {
    "from": "s2_plan",
    "to": "s2_scene",
    "label": "instrument list",
    "route": "down",
    "kind": "flow"
   },
   {
    "from": "s2_scene",
    "to": "s2_tasks",
    "label": "operable scene",
    "route": "down",
    "kind": "flow"
   },
   {
    "from": "s2_tasks",
    "to": "s2_run",
    "label": "task list",
    "route": "down",
    "kind": "flow"
   },
   {
    "from": "s3_annot",
    "to": "s3_grasp",
    "label": "grasp poses · offsets",
    "route": "down",
    "kind": "flow"
   },
   {
    "from": "s3_grasp",
    "to": "s3_atomic",
    "label": "stable grasps",
    "route": "down",
    "kind": "flow"
   },
   {
    "from": "s3_atomic",
    "to": "s3_eval",
    "label": "trained policies",
    "route": "down",
    "kind": "flow"
   },
   {
    "from": "s2_scene",
    "to": "s3_atomic",
    "label": "carved scenes",
    "route": "gutter",
    "kind": "flow",
    "lane": -1
   },
   {
    "from": "s2_tasks",
    "to": "s3_atomic",
    "label": "experiment splits",
    "route": "right",
    "kind": "flow",
    "lane": 1
   },
   {
    "from": "s2_run",
    "to": "s3_eval",
    "label": "native skills",
    "route": "right",
    "kind": "feed"
   },
   {
    "from": "s1_multilab",
    "to": "s3_eval",
    "label": "full lab for mobile runs",
    "route": "bottom",
    "kind": "feed"
   },
   {
    "from": "s2_run",
    "to": "s2_tasks",
    "label": "evidence for review",
    "route": "back",
    "kind": "flow"
   }
  ],
  "decisions": [
   "Approve or reject the balance-check tolerance extensions (second check, and the agent's own fallback).",
   "Budget for the full 37-call balance run (2–4 h; job cap is 75 min).",
   "Grasp rules: grasp short vessels from above, or place them at the table edge; GPU for batched grasp trials.",
   "Which mobile robot carries the arm in full-lab evaluation."
  ]
 }
};
