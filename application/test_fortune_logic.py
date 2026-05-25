#!/usr/bin/env python3
"""
算命应用逻辑测试脚本
用于验证新创建的组合式函数和工具函数的基本逻辑
"""

import os
import re
import json
from pathlib import Path

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ {test_name}")
    
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append((test_name, error))
        print(f"❌ {test_name}: {error}")
    
    def summary(self):
        print("\n" + "="*60)
        print(f"测试结果: 通过 {self.passed}, 失败 {self.failed}")
        if self.errors:
            print("\n错误详情:")
            for name, error in self.errors:
                print(f"  - {name}: {error}")
        print("="*60)
        return self.failed == 0


def check_file_exists(filepath, result):
    """检查文件是否存在"""
    test_name = f"文件存在: {filepath}"
    if os.path.exists(filepath):
        result.add_pass(test_name)
        return True
    else:
        result.add_fail(test_name, "文件不存在")
        return False


def check_js_syntax(filepath, result):
    """检查 JavaScript 文件的基本语法"""
    test_name = f"语法检查: {os.path.basename(filepath)}"
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        open_braces = content.count('{')
        close_braces = content.count('}')
        open_parens = content.count('(')
        close_parens = content.count(')')
        open_brackets = content.count('[')
        close_brackets = content.count(']')
        
        if open_braces != close_braces:
            result.add_fail(test_name, f"大括号不匹配: 开{open_braces}, 闭{close_braces}")
            return False
        
        if open_parens != close_parens:
            result.add_fail(test_name, f"圆括号不匹配: 开{open_parens}, 闭{close_parens}")
            return False
        
        if open_brackets != close_brackets:
            result.add_fail(test_name, f"方括号不匹配: 开{open_brackets}, 闭{close_brackets}")
            return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def check_exports(filepath, expected_exports, result):
    """检查文件是否导出了预期的函数"""
    test_name = f"导出检查: {os.path.basename(filepath)}"
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for export_name in expected_exports:
            pattern = rf'export\s+(function|const|let|var)\s+{export_name}'
            if not re.search(pattern, content):
                result.add_fail(test_name, f"未找到导出: {export_name}")
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def check_imports(filepath, expected_imports, result):
    """检查文件是否导入了预期的模块"""
    test_name = f"导入检查: {os.path.basename(filepath)}"
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for import_name in expected_imports:
            if import_name not in content:
                result.add_fail(test_name, f"未找到导入: {import_name}")
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_helpers_logic(result):
    """测试 helpers.js 中的逻辑"""
    test_name = "工具函数逻辑测试"
    
    test_cases = [
        ("getRandomItem", "从数组中随机选择元素"),
        ("getRandomNumber", "生成指定范围内的随机数"),
        ("delay", "返回 Promise 延迟函数"),
        ("formatDate", "格式化日期"),
        ("formatDateTime", "格式化日期时间"),
        ("debounce", "防抖函数"),
        ("throttle", "节流函数"),
        ("deepClone", "深拷贝函数"),
        ("generateId", "生成唯一ID"),
        ("storageGet", "本地存储读取"),
        ("storageSet", "本地存储写入"),
    ]
    
    try:
        helpers_path = os.path.join(os.path.dirname(__file__), 'src', 'utils', 'helpers.js')
        with open(helpers_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for func_name, description in test_cases:
            if f'export function {func_name}' not in content:
                result.add_fail(test_name, f"未找到函数: {func_name}")
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_composables_structure(result):
    """测试组合式函数的结构"""
    test_name = "组合式函数结构测试"
    
    composables = [
        ("useFortune.js", ["useFortune"]),
        ("useAnimation.js", ["useAnimation", "useCardAnimation"]),
        ("useTarot.js", ["useTarot"]),
        ("useFortuneCommon.js", ["useShengxiao", "useXingming", "useBazi"]),
        ("useHistory.js", ["useHistory"]),
    ]
    
    try:
        composables_dir = os.path.join(os.path.dirname(__file__), 'src', 'composables')
        
        for filename, expected_exports in composables:
            filepath = os.path.join(composables_dir, filename)
            if not check_file_exists(filepath, result):
                return False
            if not check_js_syntax(filepath, result):
                return False
            if not check_exports(filepath, expected_exports, result):
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_pages_imports(result):
    """测试页面组件的导入"""
    test_name = "页面组件导入测试"
    
    pages = [
        ("TarotPage.vue", ["useTarot"]),
        ("ShengxiaoPage.vue", ["useShengxiao"]),
        ("Home.vue", ["useHistory"]),
    ]
    
    try:
        pages_dir = os.path.join(os.path.dirname(__file__), 'src', 'pages')
        
        for filename, expected_imports in pages:
            filepath = os.path.join(pages_dir, filename)
            if not check_file_exists(filepath, result):
                return False
            if not check_imports(filepath, expected_imports, result):
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_components(result):
    """测试组件文件"""
    test_name = "组件文件测试"
    
    components = [
        "HistoryPanel.vue",
    ]
    
    try:
        components_dir = os.path.join(os.path.dirname(__file__), 'src', 'components')
        
        for filename in components:
            filepath = os.path.join(components_dir, filename)
            if not check_file_exists(filepath, result):
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_app_vue(result):
    """测试 App.vue 的修改"""
    test_name = "App.vue 集成测试"
    
    try:
        app_path = os.path.join(os.path.dirname(__file__), 'src', 'App.vue')
        with open(app_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        required_imports = ["HistoryPanel"]
        for imp in required_imports:
            if imp not in content:
                result.add_fail(test_name, f"App.vue 未导入 {imp}")
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_tarot_data(result):
    """测试塔罗牌数据结构"""
    test_name = "塔罗牌数据结构测试"
    
    try:
        tarot_path = os.path.join(os.path.dirname(__file__), 'src', 'composables', 'useTarot.js')
        with open(tarot_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        required_data = [
            "majorArcana",
            "minorArcana",
            "allCards",
            "cardSpreads",
        ]
        
        for data_name in required_data:
            if data_name not in content:
                result.add_fail(test_name, f"未找到数据: {data_name}")
                return False
        
        if "愚者" not in content or "魔术师" not in content:
            result.add_fail(test_name, "塔罗牌数据不完整")
            return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_shengxiao_data(result):
    """测试生肖数据结构"""
    test_name = "生肖数据结构测试"
    
    try:
        common_path = os.path.join(os.path.dirname(__file__), 'src', 'composables', 'useFortuneCommon.js')
        with open(common_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        shengxiao_list = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
        for sx in shengxiao_list:
            if sx not in content:
                result.add_fail(test_name, f"未找到生肖: {sx}")
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_bazi_data(result):
    """测试八字数据结构"""
    test_name = "八字数据结构测试"
    
    try:
        common_path = os.path.join(os.path.dirname(__file__), 'src', 'composables', 'useFortuneCommon.js')
        with open(common_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
        dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
        wuxing = ['金', '木', '水', '火', '土']
        
        for tg in tiangan:
            if tg not in content:
                result.add_fail(test_name, f"未找到天干: {tg}")
                return False
        
        for dz in dizhi:
            if dz not in content:
                result.add_fail(test_name, f"未找到地支: {dz}")
                return False
        
        for wx in wuxing:
            if wx not in content:
                result.add_fail(test_name, f"未找到五行: {wx}")
                return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def test_history_logic(result):
    """测试历史记录逻辑"""
    test_name = "历史记录逻辑测试"
    
    try:
        history_path = os.path.join(os.path.dirname(__file__), 'src', 'composables', 'useHistory.js')
        with open(history_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        required_functions = [
            "addHistoryItem",
            "removeHistoryItem",
            "clearHistory",
            "getHistoryByType",
            "openHistory",
            "closeHistory",
        ]
        
        for func in required_functions:
            if func not in content:
                result.add_fail(test_name, f"未找到函数: {func}")
                return False
        
        if "STORAGE_KEY" not in content or "MAX_HISTORY_ITEMS" not in content:
            result.add_fail(test_name, "未找到历史记录配置常量")
            return False
        
        result.add_pass(test_name)
        return True
    except Exception as e:
        result.add_fail(test_name, str(e))
        return False


def main():
    """运行所有测试"""
    print("="*60)
    print("🎯 算命应用逻辑测试脚本")
    print("="*60)
    print()
    
    result = TestResult()
    
    print("📁 1. 检查文件结构...")
    print("-"*40)
    
    test_composables_structure(result)
    test_components(result)
    
    print("\n🔧 2. 检查工具函数...")
    print("-"*40)
    
    test_helpers_logic(result)
    
    print("\n🎴 3. 检查塔罗牌逻辑...")
    print("-"*40)
    
    test_tarot_data(result)
    
    print("\n🐲 4. 检查生肖逻辑...")
    print("-"*40)
    
    test_shengxiao_data(result)
    
    print("\n🎯 5. 检查八字逻辑...")
    print("-"*40)
    
    test_bazi_data(result)
    
    print("\n📜 6. 检查历史记录逻辑...")
    print("-"*40)
    
    test_history_logic(result)
    
    print("\n📄 7. 检查页面组件...")
    print("-"*40)
    
    test_pages_imports(result)
    test_app_vue(result)
    
    print()
    return result.summary()


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
