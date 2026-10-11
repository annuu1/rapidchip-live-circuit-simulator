import asyncio
import os
import re
import tempfile
from typing import Dict, Tuple

VOLTAGE_LINE_REGEX = re.compile(
    r'^\s*([a-zA-Z0-9_]+)\s+([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*$'
)

async def run_ngspice_batch(netlist_str: str, timeout: float = 3.5) -> Tuple[Dict[str, float], str]:
    """
    Executes ngspice in batch mode (-b) on the provided netlist string.
    Returns (voltages_dict, raw_output).
    If ngspice times out or fails, raises an appropriate Exception.
    """
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile('w', suffix='.cir', delete=False) as f:
            f.write(netlist_str)
            tmp_path = f.name

        proc = await asyncio.create_subprocess_exec(
            'ngspice', '-b', tmp_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        try:
            stdout_bytes, stderr_bytes = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            try:
                proc.kill()
            except ProcessLookupError:
                pass
            raise RuntimeError(f"ngspice simulation timed out after {timeout}s")

        stdout = stdout_bytes.decode('utf-8', errors='replace')
        stderr = stderr_bytes.decode('utf-8', errors='replace')
        combined_output = stdout + "\n" + stderr

        # Parse node voltages from operating point (.op) output table
        voltages: Dict[str, float] = {}
        in_voltage_section = False

        for line in stdout.splitlines():
            clean_line = line.strip()
            if "Node" in clean_line and "Voltage" in clean_line:
                in_voltage_section = True
                continue
            if in_voltage_section:
                if "Source" in clean_line and "Current" in clean_line:
                    in_voltage_section = False
                    continue
                if clean_line.startswith("----") or not clean_line:
                    continue
                match = VOLTAGE_LINE_REGEX.match(clean_line)
                if match:
                    net_name = match.group(1).lower()
                    try:
                        v_val = float(match.group(2))
                        voltages[net_name] = v_val
                    except ValueError:
                        pass

        return voltages, combined_output

    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
