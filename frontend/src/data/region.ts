export interface RegionNode {
  value: string
  label: string
  children?: RegionNode[]
}

export const provinceData: RegionNode[] = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '丰台区', label: '丰台区' },
          { value: '石景山区', label: '石景山区' },
          { value: '海淀区', label: '海淀区' },
          { value: '门头沟区', label: '门头沟区' },
          { value: '房山区', label: '房山区' },
          { value: '通州区', label: '通州区' },
          { value: '顺义区', label: '顺义区' },
          { value: '昌平区', label: '昌平区' },
          { value: '大兴区', label: '大兴区' },
          { value: '怀柔区', label: '怀柔区' },
          { value: '平谷区', label: '平谷区' },
          { value: '密云区', label: '密云区' },
          { value: '延庆区', label: '延庆区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' },
          { value: '静安区', label: '静安区' },
          { value: '普陀区', label: '普陀区' },
          { value: '虹口区', label: '虹口区' },
          { value: '杨浦区', label: '杨浦区' },
          { value: '闵行区', label: '闵行区' },
          { value: '宝山区', label: '宝山区' },
          { value: '嘉定区', label: '嘉定区' },
          { value: '浦东新区', label: '浦东新区' },
          { value: '金山区', label: '金山区' },
          { value: '松江区', label: '松江区' },
          { value: '青浦区', label: '青浦区' },
          { value: '奉贤区', label: '奉贤区' },
          { value: '崇明区', label: '崇明区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '越秀区', label: '越秀区' },
          { value: '荔湾区', label: '荔湾区' },
          { value: '海珠区', label: '海珠区' },
          { value: '天河区', label: '天河区' },
          { value: '白云区', label: '白云区' },
          { value: '黄埔区', label: '黄埔区' },
          { value: '番禺区', label: '番禺区' },
          { value: '花都区', label: '花都区' },
          { value: '南沙区', label: '南沙区' },
          { value: '从化区', label: '从化区' },
          { value: '增城区', label: '增城区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '罗湖区', label: '罗湖区' },
          { value: '福田区', label: '福田区' },
          { value: '南山区', label: '南山区' },
          { value: '宝安区', label: '宝安区' },
          { value: '龙岗区', label: '龙岗区' },
          { value: '盐田区', label: '盐田区' },
          { value: '龙华区', label: '龙华区' },
          { value: '坪山区', label: '坪山区' },
          { value: '光明区', label: '光明区' }
        ]
      },
      {
        value: '珠海市',
        label: '珠海市',
        children: [
          { value: '香洲区', label: '香洲区' },
          { value: '斗门区', label: '斗门区' },
          { value: '金湾区', label: '金湾区' }
        ]
      },
      {
        value: '东莞市',
        label: '东莞市',
        children: [
          { value: '东城街道', label: '东城街道' },
          { value: '南城街道', label: '南城街道' },
          { value: '莞城街道', label: '莞城街道' },
          { value: '万江街道', label: '万江街道' },
          { value: '虎门镇', label: '虎门镇' },
          { value: '长安镇', label: '长安镇' },
          { value: '厚街镇', label: '厚街镇' },
          { value: '塘厦镇', label: '塘厦镇' },
          { value: '寮步镇', label: '寮步镇' },
          { value: '大朗镇', label: '大朗镇' },
          { value: '黄江镇', label: '黄江镇' },
          { value: '清溪溪镇', label: '清溪溪镇' },
          { value: '常平镇', label: '常平镇' },
          { value: '石碣镇', label: '石碣镇' },
          { value: '石龙镇', label: '石龙镇' },
          { value: '茶山镇', label: '茶山镇' },
          { value: '石排镇', label: '石排镇' },
          { value: '企石镇', label: '企石镇' },
          { value: '横沥镇', label: '横沥镇' },
          { value: '桥头镇', label: '桥头镇' },
          { value: '谢岗镇', label: '谢岗镇' },
          { value: '东坑镇', label: '东坑镇' },
          { value: '大岭山镇', label: '大岭山镇' },
          { value: '望牛墩镇', label: '望牛墩镇' },
          { value: '洪梅镇', label: '洪梅镇' },
          { value: '麻涌镇', label: '麻涌镇' },
          { value: '中堂镇', label: '中堂镇' },
          { value: '高埗镇', label: '高埗镇' },
          { value: '樟木头镇', label: '樟木头镇' },
          { value: '凤岗镇', label: '凤岗镇' },
          { value: '塘厦镇', label: '塘厦镇' },
          { value: '清溪镇', label: '清溪镇' },
          { value: '塘厦镇', label: '塘厦镇' }
        ]
      }
    ]
  },
  {
    value: '浙江省',
    label: '浙江省',
    children: [
      {
        value: '杭州市',
        label: '杭州市',
        children: [
          { value: '上城区', label: '上城区' },
          { value: '下城区', label: '下城区' },
          { value: '江干区', label: '江干区' },
          { value: '拱墅区', label: '拱墅区' },
          { value: '西湖区', label: '西湖区' },
          { value: '滨江区', label: '滨江区' },
          { value: '萧山区', label: '萧山区' },
          { value: '余杭区', label: '余杭区' },
          { value: '富阳区', label: '富阳区' },
          { value: '临安区', label: '临安区' },
          { value: '临平区', label: '临平区' },
          { value: '钱塘区', label: '钱塘区' },
          { value: '桐庐县', label: '桐庐县' },
          { value: '淳安县', label: '淳安县' },
          { value: '建德市', label: '建德市' }
        ]
      },
      {
        value: '宁波市',
        label: '宁波市',
        children: [
          { value: '海曙区', label: '海曙区' },
          { value: '江北区', label: '江北区' },
          { value: '北仑区', label: '北仑区' },
          { value: '镇海区', label: '镇海区' },
          { value: '鄞州区', label: '鄞州区' },
          { value: '奉化区', label: '奉化区' },
          { value: '象山县', label: '象山县' },
          { value: '宁海县', label: '宁海县' },
          { value: '余姚市', label: '余姚市' },
          { value: '慈溪市', label: '慈溪市' }
        ]
      },
      {
        value: '温州市',
        label: '温州市',
        children: [
          { value: '鹿城区', label: '鹿城区' },
          { value: '龙湾区', label: '龙湾区' },
          { value: '瓯海区', label: '瓯海区' },
          { value: '洞头区', label: '洞头区' },
          { value: '永嘉县', label: '永嘉县' },
          { value: '平阳县', label: '平阳县' },
          { value: '苍南县', label: '苍南县' },
          { value: '文成县', label: '文成县' },
          { value: '泰顺县', label: '泰顺县' },
          { value: '瑞安市', label: '瑞安市' },
          { value: '乐清市', label: '乐清市' },
          { value: '龙港市', label: '龙港市' }
        ]
      }
    ]
  },
  {
    value: '江苏省',
    label: '江苏省',
    children: [
      {
        value: '南京市',
        label: '南京市',
        children: [
          { value: '玄武区', label: '玄武区' },
          { value: '秦淮区', label: '秦淮区' },
          { value: '建邺区', label: '建邺区' },
          { value: '鼓楼区', label: '鼓楼区' },
          { value: '浦口区', label: '浦口区' },
          { value: '栖霞区', label: '栖霞区' },
          { value: '雨花台区', label: '雨花台区' },
          { value: '江宁区', label: '江宁区' },
          { value: '六合区', label: '六合区' },
          { value: '溧水区', label: '溧水区' },
          { value: '高淳区', label: '高淳区' }
        ]
      },
      {
        value: '苏州市',
        label: '苏州市',
        children: [
          { value: '虎丘区', label: '虎丘区' },
          { value: '吴中区', label: '吴中区' },
          { value: '相城区', label: '相城区' },
          { value: '姑苏区', label: '姑苏区' },
          { value: '吴江区', label: '吴江区' },
          { value: '常熟市', label: '常熟市' },
          { value: '张家港市', label: '张家港市' },
          { value: '昆山市', label: '昆山市' },
          { value: '太仓市', label: '太仓市' }
        ]
      },
      {
        value: '无锡市',
        label: '无锡市',
        children: [
          { value: '锡山区', label: '锡山区' },
          { value: '惠山区', label: '惠山区' },
          { value: '滨湖区', label: '滨湖区' },
          { value: '梁溪区', label: '梁溪区' },
          { value: '新吴区', label: '新吴区' },
          { value: '江阴市', label: '江阴市' },
          { value: '宜兴市', label: '宜兴市' }
        ]
      }
    ]
  },
  {
    value: '四川省',
    label: '四川省',
    children: [
      {
        value: '成都市',
        label: '成都市',
        children: [
          { value: '锦江区', label: '锦江区' },
          { value: '青羊区', label: '青羊区' },
          { value: '金牛区', label: '金牛区' },
          { value: '武侯区', label: '武侯区' },
          { value: '成华区', label: '成华区' },
          { value: '龙泉驿区', label: '龙泉驿区' },
          { value: '青白江区', label: '青白江区' },
          { value: '新都区', label: '新都区' },
          { value: '温江区', label: '温江区' },
          { value: '双流区', label: '双流区' },
          { value: '郫都区', label: '郫都区' },
          { value: '新津区', label: '新津区' },
          { value: '金堂县', label: '金堂县' },
          { value: '大邑县', label: '大邑县' },
          { value: '蒲江县', label: '蒲江县' },
          { value: '都江堰市', label: '都江堰市' },
          { value: '彭州市', label: '彭州市' },
          { value: '邛崃市', label: '邛崃市' },
          { value: '崇州市', label: '崇州市' },
          { value: '简阳市', label: '简阳市' }
        ]
      },
      {
        value: '绵阳市',
        label: '绵阳市',
        children: [
          { value: '涪城区', label: '涪城区' },
          { value: '游仙区', label: '游仙区' },
          { value: '安州区', label: '安州区' },
          { value: '三台县', label: '三台县' },
          { value: '盐亭县', label: '盐亭县' },
          { value: '梓潼县', label: '梓潼县' },
          { value: '北川羌族自治县', label: '北川羌族自治县' },
          { value: '平武县', label: '平武县' },
          { value: '江油市', label: '江油市' }
        ]
      }
    ]
  }
]

export const provinceOptions = provinceData.map(p => ({
  label: p.label,
  value: p.value
}))

export const getCityOptions = (province: string) => {
  const provinceNode = provinceData.find(p => p.value === province)
  if (!provinceNode || !provinceNode.children) return []
  return provinceNode.children.map(c => ({
    label: c.label,
    value: c.value
  }))
}

export const getDistrictOptions = (province: string, city: string) => {
  const provinceNode = provinceData.find(p => p.value === province)
  if (!provinceNode || !provinceNode.children) return []
  
  const cityNode = provinceNode.children.find(c => c.value === city)
  if (!cityNode || !cityNode.children) return []
  
  return cityNode.children.map(d => ({
    label: d.label,
    value: d.value
  }))
}
